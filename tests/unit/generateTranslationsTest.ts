/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import StringUtils from '@libs/StringUtils';
import generateTranslations from '../../scripts/generateTranslations';

jest.mock('openai');

let tempDir: string;
let LANGUAGES_DIR: string;
let EN_PATH: string;
let IT_PATH: string;

describe('generateTranslations', () => {
    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-test-'));
        LANGUAGES_DIR = path.join(tempDir, 'src/languages');
        EN_PATH = path.join(LANGUAGES_DIR, 'en.ts');
        IT_PATH = path.join(LANGUAGES_DIR, 'it.ts');
        fs.mkdirSync(LANGUAGES_DIR, {recursive: true});

        // Patch env to redirect script to temp path
        process.env.LANGUAGES_DIR = LANGUAGES_DIR;

        // Set --dry-run flag
        process.argv.push('--dry-run');
    });

    afterEach(() => {
        fs.rmSync(LANGUAGES_DIR, {recursive: true, force: true});
        delete process.env.LANGUAGES_DIR;
        process.argv = process.argv.filter((arg) => arg !== '--dry-run');
        jest.clearAllMocks();
    });

    it('translates nested structures', async () => {
        fs.writeFileSync(
            EN_PATH,
            StringUtils.dedent(`
                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye',
                    unnecessaryTemplate: \`This template contains no spans\`,
                    message: (username: string, count: number) => \`Hi \${username}, you have \${count} messages\`,
                    some: {
                        nested: {
                            str: 'nested string',
                            fnc: ({destructuredArg}) => \`My template string contains a single \${destructuredArg} argument\`,
                        }
                    }
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            StringUtils.dedent(`
                const strings = {
                    greeting: '[it] Hello',
                    farewell: '[it] Goodbye',
                    unnecessaryTemplate: \`[it] This template contains no spans\`,
                    message: (username: string, count: number) => \`[it] Hi \${username}, you have \${count} messages\`,
                    some: {
                        nested: {
                            str: '[it] nested string',
                            fnc: ({destructuredArg}) => \`[it] My template string contains a single \${destructuredArg} argument\`,
                        },
                    },
                };
                export default strings;
            `),
        );
    });

    it("doesn't translate strings or templates used in control flows", async () => {
        fs.writeFileSync(
            EN_PATH,
            StringUtils.dedent(`
                import Log from '@libs/Log';
                import CONST from '@src/CONST';

                if (CONST.REPORT.TYPE.EXPENSE == 'true') {
                    Log.info('This should not be translated');
                    console.log('This should not be translated either');
                }
                function myFunction(myVariable: string): boolean | string {
                    if (myVariable === 'Hello world') {
                        return true;
                    } else {
                        switch (myVariable) {
                            case 'Hello':
                                return true;
                            case 'Goodbye':
                                return false;
                            default:
                                return myVariable === 'Goodnight' ? 'Moon' : 'Sun';
                        }
                    }
                }
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            StringUtils.dedent(`
                import Log from '@libs/Log';
                import CONST from '@src/CONST';

                if (CONST.REPORT.TYPE.EXPENSE == 'true') {
                    Log.info('This should not be translated');
                    console.log('This should not be translated either');
                }
                function myFunction(myVariable: string): boolean | string {
                    if (myVariable === 'Hello world') {
                        return true;
                    } else {
                        switch (myVariable) {
                            case 'Hello':
                                return true;
                            case 'Goodbye':
                                return false;
                            default:
                                return myVariable === 'Goodnight' ? '[it] Moon' : '[it] Sun';
                        }
                    }
                }
            `),
        );
    });

    it('handles nested template expressions', async () => {
        fs.writeFileSync(
            EN_PATH,
            StringUtils.dedent(`
                const strings = {
                    simple: (name: string, greeting: string) => \`\${greeting} good sir \${name}!\`,
                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => \`\${myParams.greeting} good sir \${myParams.greeting}!\`,
                    complex: (action: {actionName: string}) => \`Edit \${action.actionName === 'shouldNotBeTranslated' ? 'expense' : 'comment'}\`,
                    complexWithNullishCoalesce: (name: string) => \`Pay \${name ?? 'someone'}\`,
                    complexWithFalsyCoalesce: (name: string) => \`Pay \${name || 'someone'}\`,
                    extraComplex: (payer: string) => \`\${payer ? \`\${payer} as payer \` : ''}paid elsewhere\`,
                    extraComplexButJustWhitespace: (payer: string) => \`\${payer ? \`\${payer} \` : ''}paid elsewhere\`,
                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => \`\${shouldBeFormal ? 'Salutations' : 'Sup'} \${shouldBeFormal ? \`Sir \${name}\` : \` \${name}\`}}\`,
                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => \`\${someBool ? \`\${someOtherBool ? 'Hello' : 'Goodbye'} moon\` : 'Goodnight, moon' }, kupo\`,
                    tooComplex: (numScanning: number, numPending: number) => {
                        const statusText: string[] = [];
                        if (numScanning > 0) {
                            statusText.push(\`\${numScanning} scanning\`);
                        }
                        if (numPending > 0) {
                            statusText.push(\`\${numPending} pending\`);
                        }
                        return statusText.length > 0 ? \`1 expense (\${statusText.join(', ')})\` : '1 expense';
                    },
                    unrealisticallyComplex: (numScanning: number, numPending: number) =>
                        \`\${(() => {
                            const statusText: string[] = [];
                            if (numScanning > 0) {
                                statusText.push(\`\${numScanning} scanning\`);
                            }
                            if (numPending > 0) {
                                statusText.push(\`\${numPending} pending\`);
                            }
                            return statusText.length > 0 ? \`1 expense (\${statusText.join(', ')})\` : '1 expense';
                        })()} If someone really uses an IIFE in here, then we've got bigger problems.\`,
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            StringUtils.dedent(`
                const strings = {
                    simple: (name: string, greeting: string) => \`[it] \${greeting} good sir \${name}!\`,
                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => \`[it] \${myParams.greeting} good sir \${myParams.greeting}!\`,
                    complex: (action: {actionName: string}) => \`[it] Edit \${action.actionName === 'shouldNotBeTranslated' ? '[it] expense' : '[it] comment'}\`,
                    complexWithNullishCoalesce: (name: string) => \`[it] Pay \${name ?? '[it] someone'}\`,
                    complexWithFalsyCoalesce: (name: string) => \`[it] Pay \${name || '[it] someone'}\`,
                    extraComplex: (payer: string) => \`[it] \${payer ? \`[it] \${payer} as payer \` : ''}paid elsewhere\`,
                    extraComplexButJustWhitespace: (payer: string) => \`[it] \${payer ? \`\${payer} \` : ''}paid elsewhere\`,
                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => \`\${shouldBeFormal ? '[it] Salutations' : '[it] Sup'} \${shouldBeFormal ? \`[it] Sir \${name}\` : \` \${name}\`}}\`,
                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => \`[it] \${someBool ? \`[it] \${someOtherBool ? '[it] Hello' : '[it] Goodbye'} moon\` : '[it] Goodnight, moon'}, kupo\`,
                    tooComplex: (numScanning: number, numPending: number) => {
                        const statusText: string[] = [];
                        if (numScanning > 0) {
                            statusText.push(\`[it] \${numScanning} scanning\`);
                        }
                        if (numPending > 0) {
                            statusText.push(\`[it] \${numPending} pending\`);
                        }
                        return statusText.length > 0 ? \`[it] 1 expense (\${statusText.join(', ')})\` : '[it] 1 expense';
                    },
                    unrealisticallyComplex: (numScanning: number, numPending: number) =>
                        \`[it] \${(() => {
                            const statusText: string[] = [];
                            if (numScanning > 0) {
                                statusText.push(\`[it] \${numScanning} scanning\`);
                            }
                            if (numPending > 0) {
                                statusText.push(\`[it] \${numPending} pending\`);
                            }
                            return statusText.length > 0 ? \`[it] 1 expense (\${statusText.join(', ')})\` : '[it] 1 expense';
                        })()} If someone really uses an IIFE in here, then we've got bigger problems.\`,
                };
                export default strings;
            `),
        );
    });

    it('Handles context annotations', async () => {
        fs.writeFileSync(
            EN_PATH,
            StringUtils.dedent(`
                const strings = {
                    // @context As in a financial institution
                    bank: 'Bank',
                    // @context As in a financial institution
                    bankTemplate: \`Bank\`,
                    // @context As in an aviation maneuver
                    aviationBank: 'Bank',
                    // This key has regular comments mixed with context-comments
                    // eslint-disable-next-line max-len
                    // @context foo
                    foo: 'Foo',
                    // @context bar
                    // What about if the context comment isn't the last comment?
                    bar: 'Bar',
                    some: {
                        nested: {
                            // @context nested
                            str: 'nested string',
                            // @context for my template function
                            func: ({destructuredArg}) => \`My template string contains a single \${destructuredArg} argument\`,
                        },
                    },
                    // @context will be applied to both translations
                    boolFunc: (flag: boolean) => flag ? 'ValueIfTrue' : 'ValueIfFalse',
                    separateContextTernaries: ((flag: boolean) => flag ? /* @context only for true */ 'True with context' : 'False without context'),
                    // @context formal greeting, only provided to outermost template translation
                    onlyInTopLevelOfTemplates: (name: string) => \`Salutations, \${name ?? /* @context inline context */ 'my very good friend'}\`,
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            StringUtils.dedent(`
                const strings = {
                    // @context As in a financial institution
                    bank: '[it][ctx: As in a financial institution] Bank',
                    // @context As in a financial institution
                    bankTemplate: \`[it][ctx: As in a financial institution] Bank\`,
                    // @context As in an aviation maneuver
                    aviationBank: '[it][ctx: As in an aviation maneuver] Bank',
                    // This key has regular comments mixed with context-comments
                    // eslint-disable-next-line max-len
                    // @context foo
                    foo: '[it][ctx: foo] Foo',
                    // @context bar
                    // What about if the context comment isn't the last comment?
                    bar: '[it][ctx: bar] Bar',
                    some: {
                        nested: {
                            // @context nested
                            str: '[it][ctx: nested] nested string',
                            // @context for my template function
                            func: ({destructuredArg}) => \`[it][ctx: for my template function] My template string contains a single \${destructuredArg} argument\`,
                        },
                    },
                    // @context will be applied to both translations
                    boolFunc: (flag: boolean) => (flag ? '[it][ctx: will be applied to both translations] ValueIfTrue' : '[it][ctx: will be applied to both translations] ValueIfFalse'),
                    separateContextTernaries: (flag: boolean) => (flag ? /* @context only for true */ '[it][ctx: only for true] True with context' : '[it] False without context'),
                    // @context formal greeting, only provided to outermost template translation
                    onlyInTopLevelOfTemplates: (name: string) => \`[it][ctx: formal greeting, only provided to outermost template translation] Salutations, \${name ?? /* @context inline context */ '[it][ctx: inline context] my very good friend'}\`,
                };
                export default strings;
            `),
        );
    });
});
