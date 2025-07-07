"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("typescript");
var TSCompilerUtils_1 = require("../../scripts/utils/TSCompilerUtils");
var dedent_1 = require("../../src/libs/StringUtils/dedent");
function createSourceFile(content) {
    return typescript_1.default.createSourceFile('test.ts', content, typescript_1.default.ScriptTarget.Latest, true);
}
function printSourceFile(sourceFile) {
    return typescript_1.default.createPrinter().printFile(sourceFile);
}
describe('TSCompilerUtils', function () {
    describe('addImport', function () {
        it('adds a default import after an existing import', function () {
            var source = createSourceFile((0, dedent_1.default)("\n                    import fs from 'fs';\n                    console.log('hello');\n                "));
            var updated = TSCompilerUtils_1.default.addImport(source, 'myModule', 'some-path');
            var output = printSourceFile(updated);
            expect(output).toBe((0, dedent_1.default)("\n                    import fs from 'fs';\n                    import myModule from \"some-path\";\n                    console.log('hello');\n                "));
        });
        it('adds a default import at the top when there are no imports', function () {
            var source = createSourceFile((0, dedent_1.default)("\n                    console.log('hello');\n                "));
            var updated = TSCompilerUtils_1.default.addImport(source, 'myModule', 'some-path');
            var output = printSourceFile(updated);
            expect(output).toBe((0, dedent_1.default)("\n                    import myModule from \"some-path\";\n                    console.log('hello');\n                "));
        });
        it('adds after multiple imports', function () {
            var source = createSourceFile((0, dedent_1.default)("\n                    import fs from 'fs';\n                    import path from 'path';\n\n                    function main() {\n                        console.log('hi');\n                    }\n                "));
            var updated = TSCompilerUtils_1.default.addImport(source, 'myModule', 'some-path');
            var output = printSourceFile(updated);
            expect(output).toBe((0, dedent_1.default)("\n                    import fs from 'fs';\n                    import path from 'path';\n                    import myModule from \"some-path\";\n                    function main() {\n                        console.log('hi');\n                    }\n                "));
        });
        it('adds to an empty file', function () {
            var source = createSourceFile("");
            var updated = TSCompilerUtils_1.default.addImport(source, 'init', './init');
            var output = printSourceFile(updated);
            expect(output).toBe((0, dedent_1.default)("\n                    import init from \"./init\";\n                "));
        });
        it('supports type-only imports', function () {
            var source = createSourceFile((0, dedent_1.default)("\n                    import fs from 'fs';\n                    console.log('hello');\n                "));
            var updated = TSCompilerUtils_1.default.addImport(source, 'MyType', 'some-path', true);
            var output = printSourceFile(updated);
            expect(output).toBe((0, dedent_1.default)("\n                    import fs from 'fs';\n                    import type MyType from \"some-path\";\n                    console.log('hello');\n                "));
        });
    });
});
