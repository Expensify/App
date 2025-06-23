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

    describe('traverseASTsInParallel', () => {
        it('visits all corresponding nodes in three aligned ASTs', () => {
            const code1 = 'const x = "Hello";';
            const code2 = 'const x = "Bonjour";';
            const code3 = 'const x = "Ciao";';

            const asts = [createSourceFile(code1), createSourceFile(code2), createSourceFile(code3)];

            const visited: Array<[ts.SyntaxKind, ts.SyntaxKind, ts.SyntaxKind]> = [];
            TSCompilerUtils.traverseASTsInParallel(asts, ([a, b, c]) => {
                visited.push([a.kind, b.kind, c.kind]);
            });

            expect(visited.length).toBeGreaterThan(0);
            for (const [a, b, c] of visited) {
                expect(a).toBe(b);
                expect(b).toBe(c);
            }
        });

        it('stops at the shallowest depth among ASTs', () => {
            const code1 = 'const x = { a: "Hello", b: "World" };';
            const code2 = 'const x = { a: "Bonjour" };';
            const asts = [createSourceFile(code1), createSourceFile(code2)];

            const visited: ts.SyntaxKind[][] = [];
            TSCompilerUtils.traverseASTsInParallel(asts, (nodes) => {
                visited.push(nodes.map((n) => n.kind));
            });

            expect(visited.length).toBeGreaterThan(0);
        });

        it('can collect parallel string literals across multiple ASTs', () => {
            const code1 = 'const a = "One"; const b = `Two`;';
            const code2 = 'const a = "Uno"; const b = `Dos`;';
            const code3 = 'const a = "Eins"; const b = `Zwei`;';

            const asts = [createSourceFile(code1), createSourceFile(code2), createSourceFile(code3)];

            const strings: Array<[string, string, string]> = [];
            TSCompilerUtils.traverseASTsInParallel(asts, ([a, b, c]) => {
                const isStr = (n: ts.Node) => ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);
                if (isStr(a) && isStr(b) && isStr(c)) {
                    strings.push([a.getText(), b.getText(), c.getText()]);
                }
            });

            expect(strings).toEqual([
                [`"One"`, `"Uno"`, `"Eins"`],
                ['`Two`', '`Dos`', '`Zwei`'],
            ]);
        });

        it('does nothing if given no ASTs', () => {
            const visitor = jest.fn();
            TSCompilerUtils.traverseASTsInParallel([], visitor);
            expect(visitor).not.toHaveBeenCalled();
        });
    });
});
