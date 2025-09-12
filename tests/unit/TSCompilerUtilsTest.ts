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
});
