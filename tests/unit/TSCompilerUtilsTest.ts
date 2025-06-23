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
        it('visits all nodes in lockstep and applies individual visitors', () => {
            const en = `const x = "Hello"; function greet(name: string) { return \`Hi \${name}\`; }`;
            const it = `const x = "Ciao"; function greet(name: string) { return \`Ciao \${name}\`; }`;

            const enAST = createSourceFile(en);
            const itAST = createSourceFile(it);

            const enKinds: ts.SyntaxKind[] = [];
            const itKinds: ts.SyntaxKind[] = [];

            TSCompilerUtils.traverseASTsInParallel([
                {
                    node: enAST,
                    visit: (node) => {
                        enKinds.push(node.kind);
                    },
                },
                {
                    node: itAST,
                    visit: (node) => {
                        itKinds.push(node.kind);
                    },
                },
            ]);

            expect(enKinds.length).toBe(itKinds.length);
            for (let i = 0; i < enKinds.length; i++) {
                expect(enKinds.at(i)).toBe(itKinds.at(i));
            }
        });

        it('collects matching string literals from multiple ASTs', () => {
            const en = `const a = "Hello"; const b = \`World\`;`;
            const it = `const a = "Ciao"; const b = \`Mondo\`;`;

            const enAST = createSourceFile(en);
            const itAST = createSourceFile(it);

            const enStrings: string[] = [];
            const itStrings: string[] = [];

            TSCompilerUtils.traverseASTsInParallel([
                {
                    node: enAST,
                    visit: (node) => {
                        if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
                            return;
                        }
                        enStrings.push(node.text);
                    },
                },
                {
                    node: itAST,
                    visit: (node) => {
                        if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
                            return;
                        }
                        itStrings.push(node.text);
                    },
                },
            ]);

            expect(enStrings).toEqual(['Hello', 'World']);
            expect(itStrings).toEqual(['Ciao', 'Mondo']);
        });

        it('traverses only the shared structure when node counts differ', () => {
            const code1 = `const x = { a: 1, b: 2 };`;
            const code2 = `const x = { a: 1 };`;

            const ast1 = createSourceFile(code1);
            const ast2 = createSourceFile(code2);

            let count1 = 0;
            let count2 = 0;

            TSCompilerUtils.traverseASTsInParallel([
                {
                    node: ast1,
                    visit: () => {
                        count1++;
                    },
                },
                {
                    node: ast2,
                    visit: () => {
                        count2++;
                    },
                },
            ]);

            // Expect both to visit the same number of shared nodes
            expect(count1).toBe(count2);
        });

        it('does nothing when given an empty array', () => {
            TSCompilerUtils.traverseASTsInParallel([]); // Should not throw
        });
    });
});
