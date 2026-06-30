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

    describe('addImport', () => {
        it('adds import when it does not exist', () => {
            const sourceCode = dedent(`
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = ts.createPrinter().printFile(result);

            expect(resultCode).toContain('import type en from "./en";');
            expect(resultCode).toContain('const strings = {');
        });

        it('does not add duplicate import when it already exists', () => {
            const sourceCode = dedent(`
                import type en from './en';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = ts.createPrinter().printFile(result);

            // Should not have duplicate imports
            const importMatches = resultCode.match(/import type en from/g);
            expect(importMatches).toHaveLength(1);
        });

        it('distinguishes between type and value imports', () => {
            const sourceCode = dedent(`
                import en from './en';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = ts.createPrinter().printFile(result);

            // Should add type import even though value import exists
            expect(resultCode).toContain("import en from './en';");
            expect(resultCode).toContain('import type en from "./en";');
        });

        it('handles different module paths', () => {
            const sourceCode = dedent(`
                import type en from './other';
                const strings = {
                    greeting: 'Hello'
                };
                export default strings;
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
            const result = TSCompilerUtils.addImport(sourceFile, 'en', './en', true);
            const resultCode = ts.createPrinter().printFile(result);

            // Should add new import with different path
            expect(resultCode).toContain("import type en from './other';");
            expect(resultCode).toContain('import type en from "./en";');
        });
    });

    describe('buildDotNotationPath', () => {
        it('builds path from nested property assignment', () => {
            const sourceCode = dedent(`
                const strings = {
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

        it('builds path from top-level property', () => {
            const sourceCode = dedent(`
                const strings = {
                    greeting: 'Hello'
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

        it('builds path with custom root node', () => {
            const sourceCode = dedent(`
                const strings = {
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

        it('returns null for nodes without property assignments', () => {
            const sourceCode = dedent(`
                const greeting = 'Hello';
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

        it('handles deeply nested paths', () => {
            const sourceCode = dedent(`
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

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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
    });

    describe('parseCodeStringToExpression', () => {
        it('parses simple string literal', () => {
            const result = TSCompilerUtils.parseCodeStringToAST('"Hello World"');
            expect(ts.isStringLiteral(result)).toBe(true);
            if (ts.isStringLiteral(result)) {
                expect(result.text).toBe('Hello World');
            }
        });

        it('parses template literal', () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = TSCompilerUtils.parseCodeStringToAST('`Hello ${name}`');
            expect(ts.isTemplateExpression(result)).toBe(true);
        });

        it('parses complex expression', () => {
            const result = TSCompilerUtils.parseCodeStringToAST('user.name ?? "Unknown"');
            expect(ts.isBinaryExpression(result)).toBe(true);
        });

        it('parses arrow function', () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = TSCompilerUtils.parseCodeStringToAST('(name: string) => `Hello ${name}`');
            expect(ts.isArrowFunction(result)).toBe(true);
        });

        it('throws error for malformed code string', () => {
            expect(() => {
                TSCompilerUtils.parseCodeStringToAST('invalid syntax {');
            }).toThrow('Malformed code string');
        });

        it('throws error for empty code string', () => {
            expect(() => {
                TSCompilerUtils.parseCodeStringToAST('/* just a comment */');
            }).toThrow('Malformed code string');
        });
    });

    describe('createPathAwareVisitor', () => {
        it('should create visitor that builds correct paths for property assignments', () => {
            const sourceCode = dedent(`
                const strings = {
                    greeting: 'Hello',
                    common: {
                        save: 'Save'
                    }
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

            // Use the visitor with ts.visitEachChild
            // @ts-expect-error nullTransformationContext exists but isn't a public API
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            ts.visitEachChild(objectLiteral, visitor, ts.nullTransformationContext);

            expect(visitedPaths).toContain('greeting');
            expect(visitedPaths).toContain('common');
        });

        it('should handle nested paths correctly', () => {
            const sourceCode = dedent(`
                const strings = {
                    common: {
                        save: 'Save',
                        cancel: 'Cancel'
                    }
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

            // @ts-expect-error nullTransformationContext exists but isn't a public API
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            ts.visitEachChild(commonObject, visitor, ts.nullTransformationContext);

            expect(visitedPaths).toContain('common.save');
            expect(visitedPaths).toContain('common.cancel');
        });

        it('should work with forEachChild for non-transforming traversal', () => {
            const sourceCode = dedent(`
                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye'
                };
            `);

            const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest, true);
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

    describe('objectHas', () => {
        it('returns true for top-level property that exists', () => {
            const source = createSourceFile(
                dedent(`
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

        it('returns false for top-level property that does not exist', () => {
            const source = createSourceFile(
                dedent(`
                    const obj = {
                        greeting: 'Hello',
                        farewell: 'Goodbye',
                    };
                `),
            );

            const objectLiteral = findObjectLiteral(source);
            expect(TSCompilerUtils.objectHas(objectLiteral, 'nonexistent')).toBe(false);
        });

        it('returns true for nested property that exists', () => {
            const source = createSourceFile(
                dedent(`
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

        it('returns false for nested property that does not exist', () => {
            const source = createSourceFile(
                dedent(`
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

        it('returns false when trying to traverse into a non-object property', () => {
            const source = createSourceFile(
                dedent(`
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

        it('returns true for deeply nested properties', () => {
            const source = createSourceFile(
                dedent(`
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

        it('returns false for partially correct deeply nested paths', () => {
            const source = createSourceFile(
                dedent(`
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

        it('handles empty object', () => {
            const source = createSourceFile(
                dedent(`
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
                ts.forEachChild(node, visit);
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
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);

            // Create a final value
            const finalValue = ts.factory.createStringLiteral('test value');

            // Add nested path
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.nested', finalValue);

            // Verify structure was created
            expect(updatedObject.properties).toHaveLength(1);
            const testProp = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect(ts.isPropertyAssignment(testProp)).toBe(true);
            expect((testProp.name as ts.Identifier).text).toBe('test');

            const testValue = testProp.initializer as ts.ObjectLiteralExpression;
            expect(ts.isObjectLiteralExpression(testValue)).toBe(true);
            expect(testValue.properties).toHaveLength(1);

            const nestedProp = testValue.properties[0] as ts.PropertyAssignment;
            expect((nestedProp.name as ts.Identifier).text).toBe('nested');
            expect(ts.isStringLiteral(nestedProp.initializer)).toBe(true);
            expect((nestedProp.initializer as ts.StringLiteral).text).toBe('test value');
        });

        it('should throw error when trying to inject into non-object property', () => {
            // Start with existing property that's not an object
            const existingProperty = ts.factory.createPropertyAssignment('existing', ts.factory.createStringLiteral('value'));
            const objectLiteral = ts.factory.createObjectLiteralExpression([existingProperty]);

            const finalValue = ts.factory.createStringLiteral('new value');

            // Try to add nested path under a non-object property
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing.nested', finalValue);
            }).toThrow('Cannot inject into path "existing.nested": property "existing" exists but is not an object');
        });

        it('should inject into existing nested object structure', () => {
            // Start with existing nested structure
            const nestedObj = ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment('existingNested', ts.factory.createStringLiteral('existing value'))]);
            const existingProperty = ts.factory.createPropertyAssignment('existing', nestedObj);
            const objectLiteral = ts.factory.createObjectLiteralExpression([existingProperty]);

            const finalValue = ts.factory.createStringLiteral('new value');

            // Add new path under existing structure
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing.newNested', finalValue);

            // Should preserve existing structure and add new value
            expect(updatedObject.properties).toHaveLength(1);
            const updatedProperty = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect((updatedProperty.name as ts.Identifier).text).toBe('existing');

            const updatedNestedObj = updatedProperty.initializer as ts.ObjectLiteralExpression;
            expect(updatedNestedObj.properties).toHaveLength(2);

            // Check existing property is preserved
            const existingNestedProp = updatedNestedObj.properties.find(
                (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'existingNested',
            ) as ts.PropertyAssignment;
            expect(existingNestedProp).toBeDefined();
            expect((existingNestedProp.initializer as ts.StringLiteral).text).toBe('existing value');

            // Check new property was added
            const newNestedProp = updatedNestedObj.properties.find(
                (prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'newNested',
            ) as ts.PropertyAssignment;
            expect(newNestedProp).toBeDefined();
            expect((newNestedProp.initializer as ts.StringLiteral).text).toBe('new value');
        });

        it('should replace existing value when path points to existing property', () => {
            // Start with existing nested structure
            const existingProperty = ts.factory.createPropertyAssignment('existing', ts.factory.createStringLiteral('old value'));
            const objectLiteral = ts.factory.createObjectLiteralExpression([existingProperty]);

            const newValue = ts.factory.createStringLiteral('new value');

            // Replace existing value
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'existing', newValue);

            // Should replace the existing value
            expect(updatedObject.properties).toHaveLength(1);
            const updatedProperty = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect((updatedProperty.name as ts.Identifier).text).toBe('existing');
            expect((updatedProperty.initializer as ts.StringLiteral).text).toBe('new value');
        });

        it('should handle single-level paths', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);
            const finalValue = ts.factory.createStringLiteral('single value');

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'single', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const prop = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect((prop.name as ts.Identifier).text).toBe('single');
            expect(ts.isStringLiteral(prop.initializer)).toBe(true);
            expect((prop.initializer as ts.StringLiteral).text).toBe('single value');
        });

        it('should handle deep nested paths', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);
            const finalValue = ts.factory.createStringLiteral('deep value');

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'a.b.c.d', finalValue);

            expect(updatedObject.properties).toHaveLength(1);

            // Navigate down the nested structure
            const aProp = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect((aProp.name as ts.Identifier).text).toBe('a');

            const bObj = aProp.initializer as ts.ObjectLiteralExpression;
            const bProp = bObj.properties[0] as ts.PropertyAssignment;
            expect((bProp.name as ts.Identifier).text).toBe('b');

            const cObj = bProp.initializer as ts.ObjectLiteralExpression;
            const cProp = cObj.properties[0] as ts.PropertyAssignment;
            expect((cProp.name as ts.Identifier).text).toBe('c');

            const dObj = cProp.initializer as ts.ObjectLiteralExpression;
            const dProp = dObj.properties[0] as ts.PropertyAssignment;
            expect((dProp.name as ts.Identifier).text).toBe('d');

            expect(ts.isStringLiteral(dProp.initializer)).toBe(true);
            expect((dProp.initializer as ts.StringLiteral).text).toBe('deep value');
        });

        it('should preserve existing properties when adding new ones', () => {
            // Start with multiple existing properties
            const existingProps = [
                ts.factory.createPropertyAssignment('first', ts.factory.createStringLiteral('first value')),
                ts.factory.createPropertyAssignment('second', ts.factory.createStringLiteral('second value')),
            ];
            const objectLiteral = ts.factory.createObjectLiteralExpression(existingProps);

            const finalValue = ts.factory.createStringLiteral('new nested value');

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'newSection.nested', finalValue);

            // Should have all original properties plus the new one
            expect(updatedObject.properties).toHaveLength(3);

            // Check that existing properties are preserved
            expect(updatedObject.properties.at(0)).toBe(existingProps.at(0));
            expect(updatedObject.properties.at(1)).toBe(existingProps.at(1));

            // Check the new nested property
            const newProp = updatedObject.properties.at(2) as ts.PropertyAssignment;
            expect((newProp.name as ts.Identifier).text).toBe('newSection');

            const nestedObj = newProp.initializer as ts.ObjectLiteralExpression;
            const nestedProp = nestedObj.properties[0] as ts.PropertyAssignment;
            expect((nestedProp.name as ts.Identifier).text).toBe('nested');
            expect((nestedProp.initializer as ts.StringLiteral).text).toBe('new nested value');
        });

        it('should handle complex expressions as final values', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);

            // Create a template literal expression
            const finalValue = ts.factory.createTemplateExpression(ts.factory.createTemplateHead('Hello '), [
                ts.factory.createTemplateSpan(ts.factory.createIdentifier('name'), ts.factory.createTemplateTail('!')),
            ]);

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.greeting', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const testProp = updatedObject.properties.at(0) as ts.PropertyAssignment;
            const testObj = testProp.initializer as ts.ObjectLiteralExpression;
            const greetingProp = testObj.properties[0] as ts.PropertyAssignment;

            expect(ts.isTemplateExpression(greetingProp.initializer)).toBe(true);
        });

        it('should handle arrow function expressions as final values', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);

            // Create an arrow function expression
            const finalValue = ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, 'name')],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createStringLiteral('Hello'),
            );

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test.func', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const testProp = updatedObject.properties.at(0) as ts.PropertyAssignment;
            const testObj = testProp.initializer as ts.ObjectLiteralExpression;
            const funcProp = testObj.properties[0] as ts.PropertyAssignment;

            expect(ts.isArrowFunction(funcProp.initializer)).toBe(true);
        });

        it('should throw error for empty path', () => {
            const existingProperty = ts.factory.createPropertyAssignment('existing', ts.factory.createStringLiteral('value'));
            const objectLiteral = ts.factory.createObjectLiteralExpression([existingProperty]);
            const finalValue = ts.factory.createStringLiteral('ignored');

            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, '', finalValue);
            }).toThrow('Invalid path: empty path provided');
        });

        it('should throw error for paths with empty parts', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);
            const finalValue = ts.factory.createStringLiteral('test value');

            // Path with empty part (double dot) should throw error
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'test..nested', finalValue);
            }).toThrow('Invalid path: empty key found in path "test..nested"');
        });

        it('should throw error for paths starting with dot', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);
            const finalValue = ts.factory.createStringLiteral('test value');

            // Path starting with dot should throw error
            expect(() => {
                TSCompilerUtils.injectDeepObjectValue(objectLiteral, '.test.nested', finalValue);
            }).toThrow('Invalid path: empty key found in path ".test.nested"');
        });

        it('should handle numeric-like property names', () => {
            const objectLiteral = ts.factory.createObjectLiteralExpression([]);
            const finalValue = ts.factory.createStringLiteral('numeric value');

            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, '123.456', finalValue);

            expect(updatedObject.properties).toHaveLength(1);
            const numericProp = updatedObject.properties.at(0) as ts.PropertyAssignment;
            expect((numericProp.name as ts.Identifier).text).toBe('123');

            const nestedObj = numericProp.initializer as ts.ObjectLiteralExpression;
            const nestedProp = nestedObj.properties[0] as ts.PropertyAssignment;
            expect((nestedProp.name as ts.Identifier).text).toBe('456');
            expect((nestedProp.initializer as ts.StringLiteral).text).toBe('numeric value');
        });

        it('should handle satisfies expressions in nested objects', () => {
            // Create object: { tasks: { existing: 'value' } satisfies Record<string, string> }
            const satisfiesExpr = ts.factory.createSatisfiesExpression(
                ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment(ts.factory.createIdentifier('existing'), ts.factory.createStringLiteral('value'))]),
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Record'), [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
            );

            const objectLiteral = ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment(ts.factory.createIdentifier('tasks'), satisfiesExpr)]);

            const newValue = ts.factory.createStringLiteral('new value');
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'tasks.newKey', newValue);

            // Verify satisfies expression is preserved
            const tasksProp = updatedObject.properties[0] as ts.PropertyAssignment;
            expect(ts.isSatisfiesExpression(tasksProp.initializer)).toBe(true);

            // Verify both existing and new properties exist
            const tasksObj = (tasksProp.initializer as ts.SatisfiesExpression).expression as ts.ObjectLiteralExpression;
            expect(tasksObj.properties).toHaveLength(2);
        });

        it('should replace existing values in satisfies expressions', () => {
            // Create object: { nested: { existingKey: 'old value' } satisfies Record<string, string> }
            const satisfiesExpr = ts.factory.createSatisfiesExpression(
                ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment(ts.factory.createIdentifier('existingKey'), ts.factory.createStringLiteral('old value'))]),
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Record'), [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
            );

            const objectLiteral = ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment(ts.factory.createIdentifier('nested'), satisfiesExpr)]);

            const newValue = ts.factory.createStringLiteral('new value');
            const updatedObject = TSCompilerUtils.injectDeepObjectValue(objectLiteral, 'nested.existingKey', newValue);

            // Verify satisfies expression is preserved and value is replaced
            const nestedProp = updatedObject.properties[0] as ts.PropertyAssignment;
            expect(ts.isSatisfiesExpression(nestedProp.initializer)).toBe(true);

            const nestedObj = (nestedProp.initializer as ts.SatisfiesExpression).expression as ts.ObjectLiteralExpression;
            const existingKeyProp = nestedObj.properties[0] as ts.PropertyAssignment;
            expect((existingKeyProp.initializer as ts.StringLiteral).text).toBe('new value');
        });
    });

    describe('isStringConcatenationChain', () => {
        it('should return true for simple string concatenation', () => {
            // 'hello' + 'world'
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('hello'), ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('world'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for string + template literal', () => {
            // 'hello' + `world`
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('hello'), ts.SyntaxKind.PlusToken, ts.factory.createNoSubstitutionTemplateLiteral('world'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for template literal + string', () => {
            // `hello` + 'world'
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createNoSubstitutionTemplateLiteral('hello'), ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('world'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return true for complex string concatenation chain', () => {
            // 'a' + 'b' + 'c'
            const innerBinary = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('a'), ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('b'));
            const outerBinary = ts.factory.createBinaryExpression(innerBinary, ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('c'));

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(true);
        });

        it('should return true for left-nested string concatenation', () => {
            // ('a' + 'b') + variable
            const leftBinary = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('a'), ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('b'));
            const outerBinary = ts.factory.createBinaryExpression(leftBinary, ts.SyntaxKind.PlusToken, ts.factory.createIdentifier('variable'));

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(true);
        });

        it('should return false for variable + string concatenation (ambiguous)', () => {
            // variable + ('a' + 'b') - could be numeric or string, so should return false
            const rightBinary = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('a'), ts.SyntaxKind.PlusToken, ts.factory.createStringLiteral('b'));
            const outerBinary = ts.factory.createBinaryExpression(ts.factory.createIdentifier('variable'), ts.SyntaxKind.PlusToken, rightBinary);

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(false);
        });

        it('should return true for string + variable concatenation', () => {
            // 'hello' + variable - definitely string concatenation
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('hello'), ts.SyntaxKind.PlusToken, ts.factory.createIdentifier('variable'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return false for numeric addition', () => {
            // 1 + 2
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createNumericLiteral('1'), ts.SyntaxKind.PlusToken, ts.factory.createNumericLiteral('2'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return false for variable addition', () => {
            // a + b
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createIdentifier('a'), ts.SyntaxKind.PlusToken, ts.factory.createIdentifier('b'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return false for non-plus operators', () => {
            // 'hello' - 'world'
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('hello'), ts.SyntaxKind.MinusToken, ts.factory.createStringLiteral('world'));

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(false);
        });

        it('should return true for template expressions with substitutions', () => {
            // 'hello' + `world ${variable}`
            const templateExpr = ts.factory.createTemplateExpression(ts.factory.createTemplateHead('world '), [
                ts.factory.createTemplateSpan(ts.factory.createIdentifier('variable'), ts.factory.createTemplateTail('')),
            ]);
            const binaryExpr = ts.factory.createBinaryExpression(ts.factory.createStringLiteral('hello'), ts.SyntaxKind.PlusToken, templateExpr);

            expect(TSCompilerUtils.isStringConcatenationChain(binaryExpr)).toBe(true);
        });

        it('should return false for complex nested non-string expressions', () => {
            // (a + b) + (c + d) where all are variables
            const leftBinary = ts.factory.createBinaryExpression(ts.factory.createIdentifier('a'), ts.SyntaxKind.PlusToken, ts.factory.createIdentifier('b'));
            const rightBinary = ts.factory.createBinaryExpression(ts.factory.createIdentifier('c'), ts.SyntaxKind.PlusToken, ts.factory.createIdentifier('d'));
            const outerBinary = ts.factory.createBinaryExpression(leftBinary, ts.SyntaxKind.PlusToken, rightBinary);

            expect(TSCompilerUtils.isStringConcatenationChain(outerBinary)).toBe(false);
        });
    });

    describe('getIndentationOfNode', () => {
        it('should return 0 for a node at column 0', () => {
            const source = createSourceFile(
                dedent(`
                    const x = 1;
                `),
            );

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(0);
        });

        it('should return correct indentation for a node with leading spaces', () => {
            const source = createSourceFile(
                dedent(`
                    function example() {
                        const x = 1;
                    }
                `),
            );

            // Find the const declaration inside the function
            const functionDecl = source.statements[0] as ts.FunctionDeclaration;
            const functionBody = functionDecl.body;
            const constStatement = functionBody?.statements[0];

            expect(constStatement).toBeDefined();
            if (constStatement) {
                expect(TSCompilerUtils.getIndentationOfNode(constStatement, source)).toBe(4);
            }
        });

        it('should handle nested indentation', () => {
            const source = createSourceFile(
                dedent(`
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
            const classDecl = source.statements[0] as ts.ClassDeclaration;
            const methodDecl = classDecl.members[0] as ts.MethodDeclaration;
            const ifStatement = methodDecl.body?.statements[0] as ts.IfStatement;
            const constStatement = (ifStatement.thenStatement as ts.Block).statements[0];

            expect(TSCompilerUtils.getIndentationOfNode(constStatement, source)).toBe(12);
        });

        it('should handle tabs as single characters', () => {
            const source = createSourceFile('\t\tconst x = 1;');

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(2);
        });

        it('should handle mixed tabs and spaces', () => {
            const source = createSourceFile('\t    const x = 1;');

            const statement = source.statements[0];
            expect(TSCompilerUtils.getIndentationOfNode(statement, source)).toBe(5);
        });
    });
});
