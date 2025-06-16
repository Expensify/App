/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import dedent from '@libs/StringUtils/dedent';
import generateTranslations, {GENERATED_FILE_PREFIX} from '../../scripts/generateTranslations';
import Translator from '../../scripts/utils/Translator/Translator';

jest.mock('openai');

let tempDir: string;
let LANGUAGES_DIR: string;
let EN_PATH: string;
let IT_PATH: string;

describe('generateTranslations', () => {
    const ORIGINAL_ARGV = process.argv;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-test-'));
        LANGUAGES_DIR = path.join(tempDir, 'src/languages');
        EN_PATH = path.join(LANGUAGES_DIR, 'en.ts');
        IT_PATH = path.join(LANGUAGES_DIR, 'it.ts');
        fs.mkdirSync(LANGUAGES_DIR, {recursive: true});

        // Patch env to redirect script to temp path
        process.env.LANGUAGES_DIR = LANGUAGES_DIR;

        // Set dry-run flag for tests
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--locales', 'it'];
    });

    afterEach(() => {
        fs.rmSync(LANGUAGES_DIR, {recursive: true, force: true});
        delete process.env.LANGUAGES_DIR;
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.argv = ORIGINAL_ARGV;
    });

    it('translates nested structures', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
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
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

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
            `)}`,
        );
    });

    it("doesn't translate strings or templates used in control flows", async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
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
            `${GENERATED_FILE_PREFIX}${dedent(`
                import Log from '@libs/Log';
                import CONST from '@src/CONST';
                import type en from './en';

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
            `)}`,
        );
    });

    it('handles nested template expressions', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    simple: (name: string, greeting: string) => \`\${greeting} good sir \${name}!\`,
                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => \`\${myParams.greeting} good sir \${myParams.greeting}!\`,
                    complex: (action: {actionName: string}) => \`Edit \${action.actionName === 'shouldNotBeTranslated' ? 'expense' : 'comment'}\`,
                    complexWithNullishCoalesce: (name: string) => \`Pay \${name ?? 'someone'}\`,
                    complexWithFalsyCoalesce: (name: string) => \`Pay \${name || 'someone'}\`,
                    extraComplex: (payer: string) => \`\${payer ? \`\${payer} as payer \` : ''}paid elsewhere\`,
                    extraComplexButJustWhitespace: (payer: string) => \`\${payer ? \`\${payer} \` : ''}paid elsewhere\`,
                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => \`\${shouldBeFormal ? 'Salutations' : 'Sup'} \${shouldBeFormal ? \`Sir \${name}\` : \` \${name}\`}}\`,
                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => \`\${someBool ? \`\${someOtherBool ? 'Hello' : 'Goodbye'} moon\` : 'Goodnight, moon' }, friend\`,
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
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

                const strings = {
                    simple: (name: string, greeting: string) => \`[it] \${greeting} good sir \${name}!\`,
                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => \`[it] \${myParams.greeting} good sir \${myParams.greeting}!\`,
                    complex: (action: {actionName: string}) => \`[it] Edit \${action.actionName === 'shouldNotBeTranslated' ? '[it] expense' : '[it] comment'}\`,
                    complexWithNullishCoalesce: (name: string) => \`[it] Pay \${name ?? '[it] someone'}\`,
                    complexWithFalsyCoalesce: (name: string) => \`[it] Pay \${name || '[it] someone'}\`,
                    extraComplex: (payer: string) => \`[it] \${payer ? \`[it] \${payer} as payer \` : ''}paid elsewhere\`,
                    extraComplexButJustWhitespace: (payer: string) => \`[it] \${payer ? \`\${payer} \` : ''}paid elsewhere\`,
                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => \`\${shouldBeFormal ? '[it] Salutations' : '[it] Sup'} \${shouldBeFormal ? \`[it] Sir \${name}\` : \` \${name}\`}}\`,
                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => \`[it] \${someBool ? \`[it] \${someOtherBool ? '[it] Hello' : '[it] Goodbye'} moon\` : '[it] Goodnight, moon'}, friend\`,
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
            `)}`,
        );
    });

    it('handles repeated ternaries in complex expressions', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    updateReportFieldAllOptionsDisabled: (count: number, enabled: boolean, option: string) => {
                        if (toggledOptionsCount > 1) {
                            return \`\${enabled ? 'enabled' : 'disabled'} all options for "\${option}".\`;
                        }
                        return \`\${enabled ? 'enabled' : 'disabled'} the option "\${option}" for the report field "\${option}", making all options \${enabled ? 'enabled' : 'disabled'}\`;
                    },
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

                const strings = {
                    updateReportFieldAllOptionsDisabled: (count: number, enabled: boolean, option: string) => {
                        if (toggledOptionsCount > 1) {
                            return \`[it] \${enabled ? '[it] enabled' : '[it] disabled'} all options for "\${option}".\`;
                        }
                        return \`[it] \${enabled ? '[it] enabled' : '[it] disabled'} the option "\${option}" for the report field "\${option}", making all options \${enabled ? '[it] enabled' : '[it] disabled'}\`;
                    },
                };
                export default strings;
            `)}`,
        );
    });

    it('Handles context annotations', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
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
                    onlyInTopLevelOfTemplates: (name: string) =>
                        \`Salutations, \${name ?? /* @context inline context */ 'my very good friend'}\`,
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

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
                    onlyInTopLevelOfTemplates: (name: string) =>
                        \`[it][ctx: formal greeting, only provided to outermost template translation] Salutations, \${name ?? /* @context inline context */ '[it][ctx: inline context] my very good friend'}\`,
                };
                export default strings;
            `)}`,
        );
    });

    it("doesn't request duplicate translations", async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye',
                    repeatGreeting: \`Hello\`,
                    nested: {
                        anotherGreeting: 'Hello',
                        anotherFarewell: 'Goodbye',
                    },
                    // @context diff
                    greetingWithDifferentContext: 'Hello',
                };
                export default strings;
            `),
            'utf8',
        );
        const translateSpy = jest.spyOn(Translator.prototype, 'translate');
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

                const strings = {
                    greeting: '[it] Hello',
                    farewell: '[it] Goodbye',
                    repeatGreeting: \`[it] Hello\`,
                    nested: {
                        anotherGreeting: '[it] Hello',
                        anotherFarewell: '[it] Goodbye',
                    },
                    // @context diff
                    greetingWithDifferentContext: '[it][ctx: diff] Hello',
                };
                export default strings;
            `)}`,
        );
        expect(translateSpy).toHaveBeenCalledTimes(3);
        expect(translateSpy).toHaveBeenNthCalledWith(1, 'it', 'Hello', undefined);
        expect(translateSpy).toHaveBeenNthCalledWith(2, 'it', 'Goodbye', undefined);
        expect(translateSpy).toHaveBeenNthCalledWith(3, 'it', 'Hello', 'diff');
    });

    it("doesn't translate type annotations", async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    myFunc: ({brand}: {brand: 'Apple' | 'Google'}) => \`\${brand} Phone\`,
                };
                export default strings;
            `),
            'utf8',
        );
        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        expect(itContent).toStrictEqual(
            `${GENERATED_FILE_PREFIX}${dedent(`
                import type en from './en';

                const strings = {
                    myFunc: ({brand}: {brand: 'Apple' | 'Google'}) => \`[it] \${brand} Phone\`,
                };
                export default strings;
            `)}`,
        );
    });
});
