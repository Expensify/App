import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import type {RetainedSourceFile} from 'typescript/async';

import {Str} from 'expensify-common';
import {runInNewContext} from 'node:vm';
import * as ts from 'typescript/ast';
import * as factory from 'typescript/ast/factory';
import {API} from 'typescript/async';

import TSCompilerUtils, {TransformerAction} from '../../scripts/utils/TSCompilerUtils';

let api: API;
const leases: RetainedSourceFile[] = [];

beforeEach(() => {
    api = new API();
});

afterEach(async () => {
    try {
        await Promise.all(leases.splice(0).map((lease) => lease.dispose()));
    } finally {
        await api.close();
    }
});

async function createSourceFile(content: string): Promise<ts.SourceFile> {
    const lease = await api.createSourceFile('test.ts', content);
    leases.push(lease);
    return lease.sourceFile;
}

function printSourceFile(sourceFile: ts.SourceFile): Promise<string> {
    return api.printer.printFile(sourceFile);
}

function expectNode<T extends ts.Node>(node: ts.Node | undefined, guard: (candidate: ts.Node) => candidate is T, expected: string): T {
    if (!node || !guard(node)) {
        throw new Error(`Expected ${expected}`);
    }
    return node;
}

function getStatement<T extends ts.Statement>(sourceFile: ts.SourceFile, index: number, guard: (candidate: ts.Node) => candidate is T, expected: string): T {
    return expectNode(sourceFile.statements.at(index), guard, expected);
}

function getProperty<T extends ts.ObjectLiteralElementLike>(objectLiteral: ts.ObjectLiteralExpression, index: number, guard: (candidate: ts.Node) => candidate is T, expected: string): T {
    return expectNode(objectLiteral.properties.at(index), guard, expected);
}

function getMember<T extends ts.ClassElement>(classDeclaration: ts.ClassDeclaration, index: number, guard: (candidate: ts.Node) => candidate is T, expected: string): T {
    return expectNode(classDeclaration.members.at(index), guard, expected);
}

function getBlockStatement<T extends ts.Statement>(block: ts.Block | undefined, index: number, guard: (candidate: ts.Node) => candidate is T, expected: string): T {
    if (!block) {
        throw new Error('Expected block');
    }
    return expectNode(block.statements.at(index), guard, expected);
}

function getObjectLiteralInitializer(property: ts.PropertyAssignment): ts.ObjectLiteralExpression {
    return expectNode(property.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
}

function getSatisfiesObjectLiteralInitializer(property: ts.PropertyAssignment): ts.ObjectLiteralExpression {
    const satisfiesExpression = expectNode(property.initializer, ts.isSatisfiesExpression, 'satisfies expression initializer');
    return expectNode(satisfiesExpression.expression, ts.isObjectLiteralExpression, 'object literal in satisfies expression');
}

function findPropertyAssignment(objectLiteral: ts.ObjectLiteralExpression, propertyName: string): ts.PropertyAssignment {
    const property = objectLiteral.properties.find((prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === propertyName);
    return expectNode(property, ts.isPropertyAssignment, `property assignment "${propertyName}"`);
}

function expectIdentifierText(node: ts.PropertyName, expected: string): void {
    if (!ts.isIdentifier(node)) {
        throw new Error('Expected identifier');
    }
    expect(node.text).toBe(expected);
}

function expectStringLiteralText(node: ts.Expression, expected: string): void {
    if (!ts.isStringLiteral(node)) {
        throw new Error('Expected string literal');
    }
    expect(node.text).toBe(expected);
}

describe('TSCompilerUtils', () => {
    describe('addImport', () => {
        it('adds a default import after an existing import', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    import fs from 'fs';
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = await printSourceFile(updated);
            expect(output).toBe(
                Str.dedent(`
                    import fs from 'fs';
                    import myModule from "some-path";
                    console.log('hello');
                `),
            );
        });

        it('adds a default import at the top when there are no imports', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = await printSourceFile(updated);
            expect(output).toBe(
                Str.dedent(`
                    import myModule from "some-path";
                    console.log('hello');
                `),
            );
        });

        it('adds after multiple imports', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    import fs from 'fs';
                    import path from 'path';

                    function main() {
                        console.log('hi');
                    }
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = await printSourceFile(updated);
            expect(output).toBe(
                Str.dedent(`
                    import fs from 'fs';
                    import path from 'path';
                    import myModule from "some-path";
                    function main() {
                        console.log('hi');
                    }
                `),
            );
        });

        it('adds to an empty file', async () => {
            const source = await createSourceFile(``);
            const updated = TSCompilerUtils.addImport(source, 'init', './init');
            const output = await printSourceFile(updated);

            expect(output).toBe(
                Str.dedent(`
                    import init from "./init";
                `),
            );
        });

        it('supports type-only imports', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    import fs from 'fs';
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'MyType', 'some-path', true);
            const output = await printSourceFile(updated);
            expect(output).toBe(
                Str.dedent(`
                    import fs from 'fs';
                    import type MyType from "some-path";
                    console.log('hello');
                `),
            );
        });
    });

    describe('findDefaultExport', () => {
        it('returns the identifier in `export default` statement', async () => {
            const code = Str.dedent(`
                const strings = { greeting: 'Hello' };
                export default strings;
            `);
            const ast = await createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result?.getText()).toBe('strings');
        });

        it('returns the object literal if directly exported', async () => {
            const code = Str.dedent(`
                export default { farewell: 'Goodbye' };
            `);
            const ast = await createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result).not.toBeNull();
            if (!result) {
                return;
            }
            expect(ts.isObjectLiteralExpression(result)).toBe(true);
            expect(result?.getText()).toContain('farewell');
        });

        it('returns null if no default export is present', async () => {
            const code = Str.dedent(`
                const foo = 'bar';
                export const greeting = 'Hello';
            `);
            const ast = await createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result).toBeNull();
        });

        it('returns identifier for `export { foo as default }`', async () => {
            const code = Str.dedent(`
                const foo = { bar: 'baz' };
                export { foo as default };
            `);
            const ast = await createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result?.getText()).toBe('default');
        });
    });

    describe('resolveDeclaration', () => {
        it('resolves a variable declaration', async () => {
            const code = Str.dedent(`
                const foo = { message: 'hi' };
            `);
            const ast = await createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('foo', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isVariableDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('message');
        });

        it('resolves a function declaration', async () => {
            const code = Str.dedent(`
                function greet() {
                    return 'hello';
                }
            `);
            const ast = await createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('greet', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isFunctionDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('hello');
        });

        it('resolves a class declaration', async () => {
            const code = Str.dedent(`
                class MyClass {
                    method() {}
                }
            `);
            const ast = await createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('MyClass', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isClassDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('method');
        });

        it('returns null for unknown identifier', async () => {
            const code = Str.dedent(`
                const foo = 123;
            `);
            const ast = await createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('bar', ast);
            expect(node).toBeNull();
        });

        it('returns declaration even if variable has no initializer', async () => {
            const code = Str.dedent(`
                let foo;
            `);
            const ast = await createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('foo', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isVariableDeclaration(node)).toBe(true);
        });
    });

    describe('extractIdentifierFromExpression', () => {
        it('extracts identifier from simple identifier', async () => {
            const code = 'translations';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from satisfies expression', async () => {
            const code = 'translations satisfies TranslationDeepObject<typeof translations>;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from as expression', async () => {
            const code = 'translations as SomeType;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from parenthesized expression', async () => {
            const code = '(translations);';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from nested parenthesized expression', async () => {
            const code = '((translations));';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from type assertion (angle bracket syntax)', async () => {
            const code = '<SomeType>translations;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from complex nested expression', async () => {
            const code = '(translations as SomeType);';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from satisfies expression with nested parentheses', async () => {
            const code = '(translations) satisfies TranslationDeepObject<typeof translations>;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('returns null for non-identifier expressions', async () => {
            const code = '"hello world";';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for complex expressions that do not contain identifiers', async () => {
            const code = '42 + 24;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for call expressions', async () => {
            const code = 'someFunction();';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for member expressions', async () => {
            const code = 'obj.property;';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('handles deeply nested expression types', async () => {
            const code = '((translations as SomeType) satisfies AnotherType);';
            const ast = await createSourceFile(code);
            const expression = getStatement(ast, 0, ts.isExpressionStatement, 'expression statement');
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });
    });

    describe('extractKeyFromPropertyNode', () => {
        it('extracts key from property assignment with identifier', async () => {
            const code = Str.dedent(`
                const obj = {
                    myKey: 'value'
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const propertyAssignment = getProperty(objLiteral, 0, ts.isPropertyAssignment, 'property assignment');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('myKey');
        });

        it('extracts key from property assignment with string literal', async () => {
            const code = Str.dedent(`
                const obj = {
                    "myStringKey": 'value'
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const propertyAssignment = getProperty(objLiteral, 0, ts.isPropertyAssignment, 'property assignment');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('myStringKey');
        });

        it('extracts key from method declaration', async () => {
            const code = Str.dedent(`
                const obj = {
                    myMethod() {
                        return 'hello';
                    }
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const methodDeclaration = getProperty(objLiteral, 0, ts.isMethodDeclaration, 'method declaration');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(methodDeclaration);
            expect(result).toBe('myMethod');
        });

        it('handles computed property names by returning undefined', async () => {
            const code = Str.dedent(`
                const obj = {
                    [computedKey]: 'value'
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const propertyAssignment = getProperty(objLiteral, 0, ts.isPropertyAssignment, 'property assignment');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBeUndefined();
        });

        it('handles numeric literal property names by returning undefined', async () => {
            const code = Str.dedent(`
                const obj = {
                    123: 'value'
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const propertyAssignment = getProperty(objLiteral, 0, ts.isPropertyAssignment, 'property assignment');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBeUndefined();
        });

        it('handles method declaration with complex name by returning undefined', async () => {
            const code = Str.dedent(`
                const obj = {
                    [Symbol.iterator]() {
                        return {};
                    }
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const methodDeclaration = getProperty(objLiteral, 0, ts.isMethodDeclaration, 'method declaration');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(methodDeclaration);
            expect(result).toBeUndefined();
        });

        it('handles arrow function property assignment', async () => {
            const code = Str.dedent(`
                const obj = {
                    arrowFunc: () => 'hello'
                };
            `);
            const ast = await createSourceFile(code);
            const varDecl = getStatement(ast, 0, ts.isVariableStatement, 'variable statement');
            const objLiteral = expectNode(varDecl.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'object literal initializer');
            const propertyAssignment = getProperty(objLiteral, 0, ts.isPropertyAssignment, 'property assignment');

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('arrowFunc');
        });
    });

    describe('addImport', () => {
        it('adds import when it does not exist', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = await printSourceFile(result);

            expect(resultCode).toContain('import type en from "./en";');
            expect(resultCode).toContain('const strings = {');
        });

        it('does not add duplicate import when it already exists', async () => {
            const sourceCode = Str.dedent(`
                import type en from './en';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = await printSourceFile(result);

            // Should not have duplicate imports
            const importMatches = resultCode.match(/import type en from/g);
            expect(importMatches).toHaveLength(1);
        });

        it('distinguishes between type and value imports', async () => {
            const sourceCode = Str.dedent(`
                import en from './en';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = await printSourceFile(result);

            // Should add type import even though value import exists
            expect(resultCode).toContain("import en from './en';");
            expect(resultCode).toContain('import type en from "./en";');
        });

        it('handles different module paths', async () => {
            const sourceCode = Str.dedent(`
                import type en from './other';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = await printSourceFile(result);

            // Should add new import with different path
            expect(resultCode).toContain("import type en from './other';");
            expect(resultCode).toContain('import type en from "./en";');
        });
    });

    describe('buildDotNotationPath', () => {
        it('builds path from nested property assignment', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableDeclaration = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableDeclaration)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableDeclaration.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const commonProperty = objectLiteral.properties[0];
            if (!ts.isPropertyAssignment(commonProperty)) {
                throw new Error('Expected property assignment');
            }

            const commonObject = commonProperty.initializer;
            if (!ts.isObjectLiteralExpression(commonObject)) {
                throw new Error('Expected object literal');
            }

            const saveProperty = commonObject.properties[0];
            if (!ts.isPropertyAssignment(saveProperty)) {
                throw new Error('Expected property assignment');
            }

            const saveStringLiteral = saveProperty.initializer;
            if (!ts.isStringLiteral(saveStringLiteral)) {
                throw new Error('Expected string literal');
            }

            const result = TSCompilerUtils.buildDotNotationPath(saveStringLiteral);
            expect(result).toBe('common.save');
        });

        it('builds path from top-level property', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    greeting: 'Hello'
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableDeclaration = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableDeclaration)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableDeclaration.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const greetingProperty = objectLiteral.properties[0];
            if (!ts.isPropertyAssignment(greetingProperty)) {
                throw new Error('Expected property assignment');
            }

            const greetingStringLiteral = greetingProperty.initializer;
            if (!ts.isStringLiteral(greetingStringLiteral)) {
                throw new Error('Expected string literal');
            }

            const result = TSCompilerUtils.buildDotNotationPath(greetingStringLiteral);
            expect(result).toBe('greeting');
        });

        it('builds path with custom root node', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableDeclaration = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableDeclaration)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableDeclaration.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const commonProperty = objectLiteral.properties[0];
            if (!ts.isPropertyAssignment(commonProperty)) {
                throw new Error('Expected property assignment');
            }

            const commonObject = commonProperty.initializer;
            if (!ts.isObjectLiteralExpression(commonObject)) {
                throw new Error('Expected object literal');
            }

            const saveProperty = commonObject.properties[0];
            if (!ts.isPropertyAssignment(saveProperty)) {
                throw new Error('Expected property assignment');
            }

            const saveStringLiteral = saveProperty.initializer;
            if (!ts.isStringLiteral(saveStringLiteral)) {
                throw new Error('Expected string literal');
            }

            // Use commonObject as root - should only get "save", not "common.save"
            const result = TSCompilerUtils.buildDotNotationPath(saveStringLiteral, commonObject);
            expect(result).toBe('save');
        });

        it('returns null for nodes without property assignments', async () => {
            const sourceCode = Str.dedent(`
                const greeting = 'Hello';
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableDeclaration = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableDeclaration)) {
                throw new Error('Expected variable statement');
            }

            const stringLiteral = variableDeclaration.declarationList.declarations[0].initializer;
            if (!stringLiteral || !ts.isStringLiteral(stringLiteral)) {
                throw new Error('Expected string literal');
            }

            const result = TSCompilerUtils.buildDotNotationPath(stringLiteral);
            expect(result).toBeNull();
        });

        it('handles deeply nested paths', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    level1: {
                        level2: {
                            level3: {
                                deep: 'Deep value'
                            }
                        }
                    }
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            // Navigate to the deeply nested string literal with proper type checking
            const variableDeclaration = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableDeclaration)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableDeclaration.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const level1Property = objectLiteral.properties[0];
            if (!ts.isPropertyAssignment(level1Property)) {
                throw new Error('Expected property assignment');
            }

            const level1Object = level1Property.initializer;
            if (!ts.isObjectLiteralExpression(level1Object)) {
                throw new Error('Expected object literal');
            }

            const level2Property = level1Object.properties[0];
            if (!ts.isPropertyAssignment(level2Property)) {
                throw new Error('Expected property assignment');
            }

            const level2Object = level2Property.initializer;
            if (!ts.isObjectLiteralExpression(level2Object)) {
                throw new Error('Expected object literal');
            }

            const level3Property = level2Object.properties[0];
            if (!ts.isPropertyAssignment(level3Property)) {
                throw new Error('Expected property assignment');
            }

            const level3Object = level3Property.initializer;
            if (!ts.isObjectLiteralExpression(level3Object)) {
                throw new Error('Expected object literal');
            }

            const deepProperty = level3Object.properties[0];
            if (!ts.isPropertyAssignment(deepProperty)) {
                throw new Error('Expected property assignment');
            }

            const deepStringLiteral = deepProperty.initializer;
            if (!ts.isStringLiteral(deepStringLiteral)) {
                throw new Error('Expected string literal');
            }

            const result = TSCompilerUtils.buildDotNotationPath(deepStringLiteral);
            expect(result).toBe('level1.level2.level3.deep');
        });

        it('collapses paths inside a function-valued property to that property', async () => {
            const sourceFile = await createSourceFile(
                Str.dedent(`
                    const strings = {
                        workspace: {
                            codingRules: ({sourcePolicyName}: {sourcePolicyName: string}) => ({
                                one: \`copied 1 merchant rule from \${sourcePolicyName}\`,
                                other: (count: number) => \`copied \${count} merchant rules from \${sourcePolicyName}\`,
                            }),
                        },
                    };
                `),
            );

            const stringsDeclaration = getStatement(sourceFile, 0, ts.isVariableStatement, 'variable statement');
            const stringsObject = expectNode(stringsDeclaration.declarationList.declarations.at(0)?.initializer, ts.isObjectLiteralExpression, 'strings object');
            const workspaceObject = getObjectLiteralInitializer(findPropertyAssignment(stringsObject, 'workspace'));
            const codingRulesProperty = findPropertyAssignment(workspaceObject, 'codingRules');
            const codingRulesFn = expectNode(codingRulesProperty.initializer, ts.isArrowFunction, 'codingRules arrow function');
            const pluralObject = expectNode(codingRulesFn.body, ts.isParenthesizedExpression, 'parenthesized plural object').expression;
            const pluralLiteral = expectNode(pluralObject, ts.isObjectLiteralExpression, 'plural object');

            const oneTemplate = expectNode(findPropertyAssignment(pluralLiteral, 'one').initializer, ts.isTemplateExpression, 'one template');
            const otherFn = expectNode(findPropertyAssignment(pluralLiteral, 'other').initializer, ts.isArrowFunction, 'other arrow function');
            const otherTemplate = expectNode(otherFn.body, ts.isTemplateExpression, 'other template');

            expect(TSCompilerUtils.buildDotNotationPath(oneTemplate)).toBe('workspace.codingRules');
            expect(TSCompilerUtils.buildDotNotationPath(otherTemplate)).toBe('workspace.codingRules');
        });
    });

    describe('parseCodeStringToExpression', () => {
        it('parses simple string literal', async () => {
            const result = await TSCompilerUtils.parseCodeStringToAST('"Hello World"', api);
            expect(ts.isStringLiteral(result)).toBe(true);
            if (ts.isStringLiteral(result)) {
                expect(result.text).toBe('Hello World');
            }
        });

        it('parses template literal', async () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = await TSCompilerUtils.parseCodeStringToAST('`Hello ${name}`', api);
            expect(ts.isTemplateExpression(result)).toBe(true);
        });

        it('parses complex expression', async () => {
            const result = await TSCompilerUtils.parseCodeStringToAST('user.name ?? "Unknown"', api);
            expect(ts.isBinaryExpression(result)).toBe(true);
        });

        it('parses arrow function', async () => {
            // Given a function containing a template, its returned AST must outlive the parser's source file lease.
            // The placeholder is fixture source, not an interpolation in this test.
            // eslint-disable-next-line no-template-curly-in-string
            const code = '(name: string) => `Hello ${name}`';
            // When parsing completes, the helper has disposed its retained source file.
            const result = await TSCompilerUtils.parseCodeStringToAST(code, api);
            // Then the detached function retains its type annotation and template when printed remotely.
            expect(ts.isArrowFunction(result)).toBe(true);
            expect(await api.printer.printNode(result)).toBe(code);
        });

        it('throws error for malformed code string', async () => {
            await expect(TSCompilerUtils.parseCodeStringToAST('invalid syntax {', api)).rejects.toThrow('Malformed code string');
        });

        it('throws error for empty code string', async () => {
            await expect(TSCompilerUtils.parseCodeStringToAST('/* just a comment */', api)).rejects.toThrow('Malformed code string');
        });
    });

    describe('createPathAwareVisitor', () => {
        it('should create visitor that builds correct paths for property assignments', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    greeting: 'Hello',
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableStatement = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableStatement)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableStatement.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const visitedPaths: string[] = [];
            const visitor = TSCompilerUtils.createPathAwareVisitor((node, path) => {
                if (ts.isPropertyAssignment(node)) {
                    visitedPaths.push(path);
                }
                return node;
            }, '');

            ts.visitEachChild(objectLiteral, visitor);

            expect(visitedPaths).toContain('greeting');
            expect(visitedPaths).toContain('common');
        });

        it('should handle nested paths correctly', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    common: {
                        save: 'Save',
                        cancel: 'Cancel'
                    }
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableStatement = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableStatement)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableStatement.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const commonProperty = objectLiteral.properties[0];
            if (!ts.isPropertyAssignment(commonProperty)) {
                throw new Error('Expected property assignment');
            }

            const commonObject = commonProperty.initializer;
            if (!ts.isObjectLiteralExpression(commonObject)) {
                throw new Error('Expected object literal');
            }

            const visitedPaths: string[] = [];
            const visitor = TSCompilerUtils.createPathAwareVisitor((node, path) => {
                if (ts.isPropertyAssignment(node)) {
                    visitedPaths.push(path);
                }
                return node;
            }, 'common');

            ts.visitEachChild(commonObject, visitor);

            expect(visitedPaths).toContain('common.save');
            expect(visitedPaths).toContain('common.cancel');
        });

        it('should work with forEachChild for non-transforming traversal', async () => {
            const sourceCode = Str.dedent(`
                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye'
                };
            `);

            const sourceFile = await createSourceFile(sourceCode);
            const variableStatement = sourceFile.statements[0];
            if (!ts.isVariableStatement(variableStatement)) {
                throw new Error('Expected variable statement');
            }

            const objectLiteral = variableStatement.declarationList.declarations[0].initializer;
            if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
                throw new Error('Expected object literal');
            }

            const visitedPaths: string[] = [];
            const visitor = TSCompilerUtils.createPathAwareVisitor((node, path) => {
                if (!ts.isPropertyAssignment(node)) {
                    return;
                }
                visitedPaths.push(path);
            }, '');

            // Use the same visitor with forEachChild - should visit both properties
            objectLiteral.forEachChild(visitor);

            expect(visitedPaths).toHaveLength(2);
            expect(visitedPaths).toContain('greeting');
            expect(visitedPaths).toContain('farewell');
        });
    });

    it('transforms children before replacing their parent and skips removed subtrees', async () => {
        // Given nested properties, a parent replacement must retain translated children and omit removed branches.
        const source = await createSourceFile("const strings = {keep: {value: 'Hello'}, remove: {value: 'Skip'}};");
        const visitedPaths: string[] = [];
        const transform = TSCompilerUtils.createPathAwareTransformer((node, translationPath) => {
            visitedPaths.push(translationPath);
            if (translationPath === 'remove') {
                return {action: TransformerAction.Remove};
            }
            if (ts.isStringLiteral(node)) {
                return {action: TransformerAction.Replace, newNode: () => factory.createStringLiteral('Translated', ts.TokenFlags.None)};
            }
            if (ts.isPropertyAssignment(node) && translationPath === 'keep') {
                return {
                    action: TransformerAction.Replace,
                    newNode: (transformed) => {
                        const property = expectNode(transformed, ts.isPropertyAssignment, 'transformed parent');
                        return TSCompilerUtils.createPropertyAssignment('renamed', property.initializer);
                    },
                };
            }
            return {action: TransformerAction.Continue};
        });

        // When the native visitor rebuilds the source file, replacement callbacks receive the transformed children.
        const output = await printSourceFile(transform(source));

        // Then parent replacement keeps the child change, and removal prevents visiting any descendants.
        expect(output).toContain('renamed: { value: "Translated"');
        expect(output).not.toContain('remove');
        expect(visitedPaths).not.toContain('remove.value');
    });

    it('preserves evaluated raw and cooked values for arbitrary template tags after round trips', async () => {
        // Given escaped tagged templates, tags can observe spelling that differs from the cooked string value.
        const code = Str.dedent(`
            (() => {
                const capture = (strings, ...values) => ({raw: [...strings.raw], cooked: [...strings], values});
                return [
                    String.raw\`a\\nb\`,
                    capture\`a\\tb /* literal */\`,
                    capture\`before\\n\${'value'}after\\t\`,
                    capture\`outer\${capture\`nested\\n\`}end\\t\`,
                ];
            })()
        `);
        const expected: unknown = runInNewContext(code);
        const sourceFile = await createSourceFile(code);

        // When an incremental patch is parsed, its detached clone must keep raw spelling after the lease is disposed.
        const clone = await TSCompilerUtils.parseCodeStringToAST(code, api);
        for (const node of [sourceFile, clone]) {
            const printed = await TSCompilerUtils.printWithoutComments(api, node);
            const actual: unknown = runInNewContext(printed);

            // Then both untouched source and detached patches pass exactly the same raw, cooked and substitution values to tags.
            expect(actual).toEqual(expected);
        }
    });

    it('removes empty and ordinary comments without changing regex, URL or nested template values', async () => {
        // Given regex and template contents that resemble comments, lexing must distinguish them from actual trivia.
        const code = Str.dedent(`
            /* real comment */
            (() => {
                const url = 'https://example.com/*literal*/';
                const pattern = /[/*][/*]/;
                const division = 8 / /**/ 2; // real comment
                return [
                    pattern.test(url),
                    \`// literal \${/**/ pattern.test(url) ? \`nested /* literal */ \${division}\` : 'none'} /* literal */\`,
                    url,
                    division,
                ];
            })()
        `);
        const expected: unknown = runInNewContext(code);
        const sourceFile = await createSourceFile(code);

        // When comments are removed, AST literal boundaries let the scanner resume inside template substitutions.
        const printed = await TSCompilerUtils.printWithoutComments(api, sourceFile);
        const actual: unknown = runInNewContext(printed);

        // Then evaluation is unchanged, including division, while ordinary and empty comments are absent.
        expect(actual).toEqual(expected);
        expect(printed).not.toContain('real comment');
        expect(printed).not.toContain('/**/');
    });

    describe('objectHas', () => {
        it('returns true for top-level property that exists', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        greeting: 'Hello',
                        farewell: 'Goodbye',
                    };
                `),
            );

            // Find the object literal
            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'greeting')).toBe(true);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'farewell')).toBe(true);
        });

        it('returns false for top-level property that does not exist', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        greeting: 'Hello',
                        farewell: 'Goodbye',
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'nonexistent')).toBe(false);
        });

        it('returns true for nested property that exists', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        common: {
                            save: 'Save',
                            cancel: 'Cancel',
                        },
                        errors: {
                            generic: 'An error occurred',
                        },
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'common.save')).toBe(true);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'common.cancel')).toBe(true);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'errors.generic')).toBe(true);
        });

        it('returns false for nested property that does not exist', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        common: {
                            save: 'Save',
                            cancel: 'Cancel',
                        },
                        errors: {
                            generic: 'An error occurred',
                        },
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'common.nonexistent')).toBe(false);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'nonexistent.save')).toBe(false);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'errors.nonexistent')).toBe(false);
        });

        it('returns false when trying to traverse into a non-object property', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        greeting: 'Hello',
                        common: {
                            save: 'Save',
                        },
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            // 'greeting' is a string, not an object, so 'greeting.something' should return false
            expect(TSCompilerUtils.objectHas(objectLiteral, 'greeting.something')).toBe(false);
        });

        it('returns true for deeply nested properties', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        level1: {
                            level2: {
                                level3: {
                                    deepProperty: 'Deep value',
                                },
                            },
                        },
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'level1.level2.level3.deepProperty')).toBe(true);
        });

        it('returns false for partially correct deeply nested paths', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {
                        level1: {
                            level2: {
                                level3: {
                                    deepProperty: 'Deep value',
                                },
                            },
                        },
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'level1.level2.level3.wrongProperty')).toBe(false);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'level1.level2.wrongLevel.deepProperty')).toBe(false);
        });

        it('handles empty object', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const obj = {};
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'anything')).toBe(false);
        });

        // Helper function to find the first object literal in a source file
        function findObjectLiteral(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression {
            let objectLiteral: ts.ObjectLiteralExpression | undefined;

            function visit(node: ts.Node): void {
                if (ts.isObjectLiteralExpression(node) && !objectLiteral) {
                    objectLiteral = node;
                    return;
                }
                node.forEachChild(visit);
            }

            visit(sourceFile);
            if (!objectLiteral) {
                throw new Error('No object literal found in source file');
            }
            return objectLiteral;
        }
    });

    describe('injectDeepObjectValue', () => {
        it('should inject value into basic nested structure', () => {
            // Start with empty object
            const objectLiteral = factory.createObjectLiteralExpression([]);

            // Create a final value
            const finalValue = factory.createStringLiteral('test value', ts.TokenFlags.None);

            // Add nested path
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.nested', finalValue);

            // Verify structure was created
            expect(updatedObject.properties).toHaveLength(1);
            const testProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(testProp.name, 'test');

            const testValue = getObjectLiteralInitializer(testProp);
            expect(testValue.properties).toHaveLength(1);

            const nestedProp = getProperty(testValue, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(nestedProp.name, 'nested');
            expectStringLiteralText(nestedProp.initializer, 'test value');
        });

        it('should throw error when trying to inject into non-object property', () => {
            // Start with existing property that's not an object
            const existingProperty = TSCompilerUtils.createPropertyAssignment('existing', factory.createStringLiteral('value', ts.TokenFlags.None));
            const objectLiteral = factory.createObjectLiteralExpression([existingProperty]);

            const finalValue = factory.createStringLiteral('new value', ts.TokenFlags.None);

            // Try to add nested path under a non-object property
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing.nested', finalValue);
            }).toThrow('Cannot inject into path "existing.nested": property "existing" exists but is not an object');
        });

        it('should inject into existing nested object structure', () => {
            // Start with existing nested structure
            const nestedObj = factory.createObjectLiteralExpression([
                TSCompilerUtils.createPropertyAssignment('existingNested', factory.createStringLiteral('existing value', ts.TokenFlags.None)),
            ]);
            const existingProperty = TSCompilerUtils.createPropertyAssignment('existing', nestedObj);
            const objectLiteral = factory.createObjectLiteralExpression([existingProperty]);

            const finalValue = factory.createStringLiteral('new value', ts.TokenFlags.None);

            // Add new path under existing structure
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing.newNested', finalValue);

            // Should preserve existing structure and add new value
            expect(updatedObject.properties).toHaveLength(1);
            const updatedProperty = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(updatedProperty.name, 'existing');

            const updatedNestedObj = getObjectLiteralInitializer(updatedProperty);
            expect(updatedNestedObj.properties).toHaveLength(2);

            // Check existing property is preserved
            const existingNestedProp = findPropertyAssignment(updatedNestedObj, 'existingNested');
            expectStringLiteralText(existingNestedProp.initializer, 'existing value');

            // Check new property was added
            const newNestedProp = findPropertyAssignment(updatedNestedObj, 'newNested');
            expectStringLiteralText(newNestedProp.initializer, 'new value');
        });

        it('should replace existing value when path points to existing property', () => {
            // Start with existing nested structure
            const existingProperty = TSCompilerUtils.createPropertyAssignment('existing', factory.createStringLiteral('old value', ts.TokenFlags.None));
            const objectLiteral = factory.createObjectLiteralExpression([existingProperty]);

            const newValue = factory.createStringLiteral('new value', ts.TokenFlags.None);

            // Replace existing value
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing', newValue);

            // Should replace the existing value
            expect(updatedObject.properties).toHaveLength(1);
            const updatedProperty = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(updatedProperty.name, 'existing');
            expectStringLiteralText(updatedProperty.initializer, 'new value');
        });

        it('should handle single-level paths', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);
            const finalValue = factory.createStringLiteral('single value', ts.TokenFlags.None);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'single', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const prop = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(prop.name, 'single');
            expectStringLiteralText(prop.initializer, 'single value');
        });

        it('should handle deep nested paths', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);
            const finalValue = factory.createStringLiteral('deep value', ts.TokenFlags.None);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'a.b.c.d', finalValue);

            expect(updatedObject.properties).toHaveLength(1);

            // Navigate down the nested structure
            const aProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(aProp.name, 'a');

            const bObj = getObjectLiteralInitializer(aProp);
            const bProp = getProperty(bObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(bProp.name, 'b');

            const cObj = getObjectLiteralInitializer(bProp);
            const cProp = getProperty(cObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(cProp.name, 'c');

            const dObj = getObjectLiteralInitializer(cProp);
            const dProp = getProperty(dObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(dProp.name, 'd');

            expectStringLiteralText(dProp.initializer, 'deep value');
        });

        it('should preserve existing properties when adding new ones', () => {
            // Start with multiple existing properties
            const existingProps = [
                TSCompilerUtils.createPropertyAssignment('first', factory.createStringLiteral('first value', ts.TokenFlags.None)),
                TSCompilerUtils.createPropertyAssignment('second', factory.createStringLiteral('second value', ts.TokenFlags.None)),
            ];
            const objectLiteral = factory.createObjectLiteralExpression(existingProps);

            const finalValue = factory.createStringLiteral('new nested value', ts.TokenFlags.None);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'newSection.nested', finalValue);

            // Should have all original properties plus the new one
            expect(updatedObject.properties).toHaveLength(3);

            // Check that existing properties are preserved
            expect(updatedObject.properties.at(0)).toBe(existingProps.at(0));
            expect(updatedObject.properties.at(1)).toBe(existingProps.at(1));

            // Check the new nested property
            const newProp = getProperty(updatedObject, 2, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(newProp.name, 'newSection');

            const nestedObj = getObjectLiteralInitializer(newProp);
            const nestedProp = getProperty(nestedObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(nestedProp.name, 'nested');
            expectStringLiteralText(nestedProp.initializer, 'new nested value');
        });

        it('should handle complex expressions as final values', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);

            // Create a template literal expression
            const finalValue = factory.createTemplateExpression(factory.createTemplateHead('Hello ', '', ts.TokenFlags.None), [
                factory.createTemplateSpan(factory.createIdentifier('name'), factory.createTemplateTail('!', '', ts.TokenFlags.None)),
            ]);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.greeting', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const testProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            const testObj = getObjectLiteralInitializer(testProp);
            const greetingProp = getProperty(testObj, 0, ts.isPropertyAssignment, 'property assignment');

            expect(ts.isTemplateExpression(greetingProp.initializer)).toBe(true);
        });

        it('should handle arrow function expressions as final values', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);

            // Create an arrow function expression
            const finalValue = factory.createArrowFunction(
                undefined,
                undefined,
                [factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier('name'))],
                undefined,
                factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                factory.createStringLiteral('Hello', ts.TokenFlags.None),
            );

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.func', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const testProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            const testObj = getObjectLiteralInitializer(testProp);
            const funcProp = getProperty(testObj, 0, ts.isPropertyAssignment, 'property assignment');

            expect(ts.isArrowFunction(funcProp.initializer)).toBe(true);
        });

        it('should throw error for empty path', () => {
            const existingProperty = TSCompilerUtils.createPropertyAssignment('existing', factory.createStringLiteral('value', ts.TokenFlags.None));
            const objectLiteral = factory.createObjectLiteralExpression([existingProperty]);
            const finalValue = factory.createStringLiteral('ignored', ts.TokenFlags.None);

            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, '', finalValue);
            }).toThrow('Invalid path: empty path provided');
        });

        it('should throw error for paths with empty parts', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);
            const finalValue = factory.createStringLiteral('test value', ts.TokenFlags.None);

            // Path with empty part (double dot) should throw error
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test..nested', finalValue);
            }).toThrow('Invalid path: empty key found in path "test..nested"');
        });

        it('should throw error for paths starting with dot', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);
            const finalValue = factory.createStringLiteral('test value', ts.TokenFlags.None);

            // Path starting with dot should throw error
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, '.test.nested', finalValue);
            }).toThrow('Invalid path: empty key found in path ".test.nested"');
        });

        it('should handle numeric-like property names', () => {
            const objectLiteral = factory.createObjectLiteralExpression([]);
            const finalValue = factory.createStringLiteral('numeric value', ts.TokenFlags.None);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, '123.456', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const numericProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(numericProp.name, '123');

            const nestedObj = getObjectLiteralInitializer(numericProp);
            const nestedProp = getProperty(nestedObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectIdentifierText(nestedProp.name, '456');
            expectStringLiteralText(nestedProp.initializer, 'numeric value');
        });

        it('should handle satisfies expressions in nested objects', () => {
            // Create object: { tasks: { existing: 'value' } satisfies Record<string, string> }
            const satisfiesExpr = factory.createSatisfiesExpression(
                factory.createObjectLiteralExpression([
                    TSCompilerUtils.createPropertyAssignment(factory.createIdentifier('existing'), factory.createStringLiteral('value', ts.TokenFlags.None)),
                ]),
                factory.createTypeReferenceNode(factory.createIdentifier('Record'), [
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
            );

            const objectLiteral = factory.createObjectLiteralExpression([TSCompilerUtils.createPropertyAssignment(factory.createIdentifier('tasks'), satisfiesExpr)]);

            const newValue = factory.createStringLiteral('new value', ts.TokenFlags.None);
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'tasks.newKey', newValue);

            // Verify satisfies expression is preserved
            const tasksProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expect(ts.isSatisfiesExpression(tasksProp.initializer)).toBe(true);

            // Verify both existing and new properties exist
            const tasksObj = getSatisfiesObjectLiteralInitializer(tasksProp);
            expect(tasksObj.properties).toHaveLength(2);
        });

        it('should replace existing values in satisfies expressions', () => {
            // Create object: { nested: { existingKey: 'old value' } satisfies Record<string, string> }
            const satisfiesExpr = factory.createSatisfiesExpression(
                factory.createObjectLiteralExpression([
                    TSCompilerUtils.createPropertyAssignment(factory.createIdentifier('existingKey'), factory.createStringLiteral('old value', ts.TokenFlags.None)),
                ]),
                factory.createTypeReferenceNode(factory.createIdentifier('Record'), [
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
            );

            const objectLiteral = factory.createObjectLiteralExpression([TSCompilerUtils.createPropertyAssignment(factory.createIdentifier('nested'), satisfiesExpr)]);

            const newValue = factory.createStringLiteral('new value', ts.TokenFlags.None);
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'nested.existingKey', newValue);

            // Verify satisfies expression is preserved and value is replaced
            const nestedProp = getProperty(updatedObject, 0, ts.isPropertyAssignment, 'property assignment');
            expect(ts.isSatisfiesExpression(nestedProp.initializer)).toBe(true);

            const nestedObj = getSatisfiesObjectLiteralInitializer(nestedProp);
            const existingKeyProp = getProperty(nestedObj, 0, ts.isPropertyAssignment, 'property assignment');
            expectStringLiteralText(existingKeyProp.initializer, 'new value');
        });
    });

    describe('isStringConcatenationChain', () => {
        it('should return true for simple string concatenation', () => {
            // 'hello' + 'world'
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('world', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for string + template literal', () => {
            // 'hello' + `world`
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createNoSubstitutionTemplateLiteral('world', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for template literal + string', () => {
            // `hello` + 'world'
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createNoSubstitutionTemplateLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('world', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for complex string concatenation chain', () => {
            // 'a' + 'b' + 'c'
            const innerBinary = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('a', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('b', ts.TokenFlags.None),
            );
            const outerBinary = factory.createBinaryExpression(
                undefined,
                innerBinary,
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('c', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(true);
        });

        it('should return true for left-nested string concatenation', () => {
            // ('a' + 'b') + variable
            const leftBinary = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('a', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('b', ts.TokenFlags.None),
            );
            const outerBinary = factory.createBinaryExpression(undefined, leftBinary, undefined, factory.createToken(ts.SyntaxKind.PlusToken), factory.createIdentifier('variable'));

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(true);
        });

        it('should return false for variable + string concatenation (ambiguous)', () => {
            // variable + ('a' + 'b') - could be numeric or string, so should return false
            const rightBinary = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('a', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createStringLiteral('b', ts.TokenFlags.None),
            );
            const outerBinary = factory.createBinaryExpression(
                undefined,
                factory.createIdentifier('variable'),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createParenthesizedExpression(rightBinary),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(false);
        });

        it('should return true for string + variable concatenation', () => {
            // 'hello' + variable - definitely string concatenation
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createIdentifier('variable'),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return false for numeric addition', () => {
            // 1 + 2
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createNumericLiteral('1', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createNumericLiteral('2', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return false for variable addition', () => {
            // a + b
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createIdentifier('a'),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createIdentifier('b'),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return false for non-plus operators', () => {
            // 'hello' - 'world'
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.MinusToken),
                factory.createStringLiteral('world', ts.TokenFlags.None),
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return true for template expressions with substitutions', () => {
            // 'hello' + `world ${variable}`
            const templateExpr = factory.createTemplateExpression(factory.createTemplateHead('world ', '', ts.TokenFlags.None), [
                factory.createTemplateSpan(factory.createIdentifier('variable'), factory.createTemplateTail('', '', ts.TokenFlags.None)),
            ]);
            const binaryExpr = factory.createBinaryExpression(
                undefined,
                factory.createStringLiteral('hello', ts.TokenFlags.None),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                templateExpr,
            );

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return false for complex nested non-string expressions', () => {
            // (a + b) + (c + d) where all are variables
            const leftBinary = factory.createBinaryExpression(
                undefined,
                factory.createIdentifier('a'),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createIdentifier('b'),
            );
            const rightBinary = factory.createBinaryExpression(
                undefined,
                factory.createIdentifier('c'),
                undefined,
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createIdentifier('d'),
            );
            const outerBinary = factory.createBinaryExpression(undefined, leftBinary, undefined, factory.createToken(ts.SyntaxKind.PlusToken), rightBinary);

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(false);
        });
    });

    describe('getIndentationOfNode', () => {
        it('should return 0 for a node at column 0', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    const x = 1;
                `),
            );

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(0);
        });

        it('should return correct indentation for a node with leading spaces', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    function example() {
                        const x = 1;
                    }
                `),
            );

            // Find the const declaration inside the function
            const functionDecl = getStatement(source, 0, ts.isFunctionDeclaration, 'function declaration');
            const constStatement = getBlockStatement(functionDecl.body, 0, ts.isVariableStatement, 'variable statement');

            expect(TSCompilerUtils.getIndentationOfNode(constStatement, source)).toBe(4);
        });

        it('should handle nested indentation', async () => {
            const source = await createSourceFile(
                Str.dedent(`
                    class MyClass {
                        method() {
                            if (true) {
                                const x = 1;
                            }
                        }
                    }
                `),
            );

            // Navigate to the deeply nested const statement
            const classDecl = getStatement(source, 0, ts.isClassDeclaration, 'class declaration');
            const methodDecl = getMember(classDecl, 0, ts.isMethodDeclaration, 'method declaration');
            const ifStatement = getBlockStatement(methodDecl.body, 0, ts.isIfStatement, 'if statement');
            const thenBlock = expectNode(ifStatement.thenStatement, ts.isBlock, 'then block');
            const constStatement = getBlockStatement(thenBlock, 0, ts.isVariableStatement, 'variable statement');

            expect(TSCompilerUtils.getIndentationOfNode(constStatement, source)).toBe(12);
        });

        it('should handle tabs as single characters', async () => {
            const source = await createSourceFile('\t\tconst x = 1;');

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(2);
        });

        it('should handle mixed tabs and spaces', async () => {
            const source = await createSourceFile('\t    const x = 1;');

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(5);
        });
    });
});
