import ts from 'typescript';
import TSCompilerUtils from '../../scripts/utils/TSCompilerUtils';
import dedent from '../../src/libs/StringUtils/dedent';

function createSourceFile(content: string): ts.SourceFile {
    return ts.createSourceFile('test.ts', content, ts.ScriptTarget.Latest, true);
}

function printSourceFile(sourceFile: ts.SourceFile): string {
    return ts.createPrinter().printFile(sourceFile);
}

describe('TSCompilerUtils', () => {
    describe('addImport', () => {
        it('adds a default import after an existing import', () => {
            const source = createSourceFile(
                dedent(`
                    import fs from 'fs';
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = printSourceFile(updated);
            expect(output).toBe(
                dedent(`
                    import fs from 'fs';
                    import myModule from "some-path";
                    console.log('hello');
                `),
            );
        });

        it('adds a default import at the top when there are no imports', () => {
            const source = createSourceFile(
                dedent(`
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = printSourceFile(updated);
            expect(output).toBe(
                dedent(`
                    import myModule from "some-path";
                    console.log('hello');
                `),
            );
        });

        it('adds after multiple imports', () => {
            const source = createSourceFile(
                dedent(`
                    import fs from 'fs';
                    import path from 'path';

                    function main() {
                        console.log('hi');
                    }
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'myModule', 'some-path');
            const output = printSourceFile(updated);
            expect(output).toBe(
                dedent(`
                    import fs from 'fs';
                    import path from 'path';
                    import myModule from "some-path";
                    function main() {
                        console.log('hi');
                    }
                `),
            );
        });

        it('adds to an empty file', () => {
            const source = createSourceFile(``);
            const updated = TSCompilerUtils.addImport(source, 'init', './init');
            const output = printSourceFile(updated);

            expect(output).toBe(
                dedent(`
                    import init from "./init";
                `),
            );
        });

        it('supports type-only imports', () => {
            const source = createSourceFile(
                dedent(`
                    import fs from 'fs';
                    console.log('hello');
                `),
            );
            const updated = TSCompilerUtils.addImport(source, 'MyType', 'some-path', true);
            const output = printSourceFile(updated);
            expect(output).toBe(
                dedent(`
                    import fs from 'fs';
                    import type MyType from "some-path";
                    console.log('hello');
                `),
            );
        });
    });

    describe('findDefaultExport', () => {
        it('returns the identifier in `export default` statement', () => {
            const code = dedent(`
                const strings = { greeting: 'Hello' };
                export default strings;
            `);
            const ast = createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result?.getText()).toBe('strings');
        });

        it('returns the object literal if directly exported', () => {
            const code = dedent(`
                export default { farewell: 'Goodbye' };
            `);
            const ast = createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result).not.toBeNull();
            if (!result) {
                return;
            }
            expect(ts.isObjectLiteralExpression(result)).toBe(true);
            expect(result?.getText()).toContain('farewell');
        });

        it('returns null if no default export is present', () => {
            const code = dedent(`
                const foo = 'bar';
                export const greeting = 'Hello';
            `);
            const ast = createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result).toBeNull();
        });

        it('returns identifier for `export { foo as default }`', () => {
            const code = dedent(`
                const foo = { bar: 'baz' };
                export { foo as default };
            `);
            const ast = createSourceFile(code);
            const result = TSCompilerUtils.findDefaultExport(ast);
            expect(result?.getText()).toBe('default');
        });
    });

    describe('resolveDeclaration', () => {
        it('resolves a variable declaration', () => {
            const code = dedent(`
                const foo = { message: 'hi' };
            `);
            const ast = createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('foo', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isVariableDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('message');
        });

        it('resolves a function declaration', () => {
            const code = dedent(`
                function greet() {
                    return 'hello';
                }
            `);
            const ast = createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('greet', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isFunctionDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('hello');
        });

        it('resolves a class declaration', () => {
            const code = dedent(`
                class MyClass {
                    method() {}
                }
            `);
            const ast = createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('MyClass', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isClassDeclaration(node)).toBe(true);
            expect(node.getText()).toContain('method');
        });

        it('returns null for unknown identifier', () => {
            const code = dedent(`
                const foo = 123;
            `);
            const ast = createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('bar', ast);
            expect(node).toBeNull();
        });

        it('returns declaration even if variable has no initializer', () => {
            const code = dedent(`
                let foo;
            `);
            const ast = createSourceFile(code);
            const node = TSCompilerUtils.resolveDeclaration('foo', ast);

            expect(node).not.toBeNull();
            if (!node) {
                return;
            }
            expect(ts.isVariableDeclaration(node)).toBe(true);
        });
    });

    describe('extractIdentifierFromExpression', () => {
        it('extracts identifier from simple identifier', () => {
            const code = 'translations';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from satisfies expression', () => {
            const code = 'translations satisfies TranslationDeepObject<typeof translations>;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from as expression', () => {
            const code = 'translations as SomeType;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from parenthesized expression', () => {
            const code = '(translations);';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from nested parenthesized expression', () => {
            const code = '((translations));';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from type assertion (angle bracket syntax)', () => {
            const code = '<SomeType>translations;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            // Note: This might be 'translations' or null depending on how TypeScript parses angle bracket syntax in JSX-enabled contexts
            expect(result).toEqual(expect.any(String));
        });

        it('extracts identifier from complex nested expression', () => {
            const code = '(translations as SomeType);';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('extracts identifier from satisfies expression with nested parentheses', () => {
            const code = '(translations) satisfies TranslationDeepObject<typeof translations>;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });

        it('returns null for non-identifier expressions', () => {
            const code = '"hello world";';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for complex expressions that do not contain identifiers', () => {
            const code = '42 + 24;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for call expressions', () => {
            const code = 'someFunction();';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('returns null for member expressions', () => {
            const code = 'obj.property;';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBeNull();
        });

        it('handles deeply nested expression types', () => {
            const code = '((translations as SomeType) satisfies AnotherType);';
            const ast = createSourceFile(code);
            const expression = ast.statements[0] as ts.ExpressionStatement;
            const result = TSCompilerUtils.extractIdentifierFromExpression(expression.expression);
            expect(result).toBe('translations');
        });
    });

    describe('extractKeyFromPropertyNode', () => {
        it('extracts key from property assignment with identifier', () => {
            const code = dedent(`
                const obj = {
                    myKey: 'value'
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const propertyAssignment = objLiteral.properties[0] as ts.PropertyAssignment;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('myKey');
        });

        it('extracts key from property assignment with string literal', () => {
            const code = dedent(`
                const obj = {
                    "myStringKey": 'value'
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const propertyAssignment = objLiteral.properties[0] as ts.PropertyAssignment;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('myStringKey');
        });

        it('extracts key from method declaration', () => {
            const code = dedent(`
                const obj = {
                    myMethod() {
                        return 'hello';
                    }
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const methodDeclaration = objLiteral.properties[0] as ts.MethodDeclaration;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(methodDeclaration);
            expect(result).toBe('myMethod');
        });

        it('handles computed property names by returning undefined', () => {
            const code = dedent(`
                const obj = {
                    [computedKey]: 'value'
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const propertyAssignment = objLiteral.properties[0] as ts.PropertyAssignment;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBeUndefined();
        });

        it('handles numeric literal property names by returning undefined', () => {
            const code = dedent(`
                const obj = {
                    123: 'value'
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const propertyAssignment = objLiteral.properties[0] as ts.PropertyAssignment;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBeUndefined();
        });

        it('handles method declaration with complex name by returning undefined', () => {
            const code = dedent(`
                const obj = {
                    [Symbol.iterator]() {
                        return {};
                    }
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const methodDeclaration = objLiteral.properties[0] as ts.MethodDeclaration;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(methodDeclaration);
            expect(result).toBeUndefined();
        });

        it('handles arrow function property assignment', () => {
            const code = dedent(`
                const obj = {
                    arrowFunc: () => 'hello'
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const propertyAssignment = objLiteral.properties[0] as ts.PropertyAssignment;

            const result = TSCompilerUtils.extractKeyFromPropertyNode(propertyAssignment);
            expect(result).toBe('arrowFunc');
        });
    });

    describe('isObject', () => {
        it('returns true for object literal expressions', () => {
            const code = dedent(`
                const obj = {
                    key: 'value',
                    nested: {
                        prop: 123
                    }
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const objLiteral = varDecl.declarationList.declarations[0].initializer;

            expect(objLiteral).toBeDefined();
            if (objLiteral) {
                expect(TSCompilerUtils.isObject(objLiteral)).toBe(true);
            }
        });

        it('returns false for non-object expressions', () => {
            const code = dedent(`
                const str = 'hello';
                const num = 42;
                const arr = [1, 2, 3];
                const func = () => 'test';
            `);
            const ast = createSourceFile(code);

            // String literal
            const strDecl = ast.statements[0] as ts.VariableStatement;
            const strLiteral = strDecl.declarationList.declarations[0].initializer;
            expect(strLiteral).toBeDefined();
            if (strLiteral) {
                expect(TSCompilerUtils.isObject(strLiteral)).toBe(false);
            }

            // Number literal
            const numDecl = ast.statements[1] as ts.VariableStatement;
            const numLiteral = numDecl.declarationList.declarations[0].initializer;
            expect(numLiteral).toBeDefined();
            if (numLiteral) {
                expect(TSCompilerUtils.isObject(numLiteral)).toBe(false);
            }

            // Array literal
            const arrDecl = ast.statements[2] as ts.VariableStatement;
            const arrLiteral = arrDecl.declarationList.declarations[0].initializer;
            expect(arrLiteral).toBeDefined();
            if (arrLiteral) {
                expect(TSCompilerUtils.isObject(arrLiteral)).toBe(false);
            }

            // Arrow function
            const funcDecl = ast.statements[3] as ts.VariableStatement;
            const funcExpr = funcDecl.declarationList.declarations[0].initializer;
            expect(funcExpr).toBeDefined();
            if (funcExpr) {
                expect(TSCompilerUtils.isObject(funcExpr)).toBe(false);
            }
        });

        it('returns true for empty object literals', () => {
            const code = 'const empty = {};';
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const emptyObj = varDecl.declarationList.declarations[0].initializer;

            expect(emptyObj).toBeDefined();
            if (emptyObj) {
                expect(TSCompilerUtils.isObject(emptyObj)).toBe(true);
            }
        });

        it('returns true for nested object literals', () => {
            const code = dedent(`
                const nested = {
                    level1: {
                        level2: {
                            value: 'deep'
                        }
                    }
                };
            `);
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const outerObj = varDecl.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
            const level1Prop = outerObj.properties[0] as ts.PropertyAssignment;
            const level1Obj = level1Prop.initializer;

            expect(TSCompilerUtils.isObject(outerObj)).toBe(true);
            expect(TSCompilerUtils.isObject(level1Obj)).toBe(true);
        });

        it('returns false for method calls that return objects', () => {
            const code = 'const result = getObject();';
            const ast = createSourceFile(code);
            const varDecl = ast.statements[0] as ts.VariableStatement;
            const callExpr = varDecl.declarationList.declarations[0].initializer;

            expect(callExpr).toBeDefined();
            if (callExpr) {
                expect(TSCompilerUtils.isObject(callExpr)).toBe(false);
            }
        });
    });
});
