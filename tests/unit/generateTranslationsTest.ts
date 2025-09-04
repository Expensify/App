/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import GitHubUtils from '@github/libs/GithubUtils';
import dedent from '@libs/StringUtils/dedent';
import generateTranslations, {GENERATED_FILE_PREFIX} from '@scripts/generateTranslations';
import Translator from '@scripts/utils/Translator/Translator';

let processExitSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
let mockEn: any = jest.requireActual('@src/languages/en');
jest.mock('@src/languages/en', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    get default() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return mockEn;
    },
}));
jest.mock('openai');

let tempDir: string;
let LANGUAGES_DIR: string;
let EN_PATH: string;
let IT_PATH: string;

describe('generateTranslations', () => {
    const ORIGINAL_ARGV = process.argv;

    beforeEach(() => {
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        consoleErrorSpy = jest.spyOn(console, 'error');

        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-test-'));
        LANGUAGES_DIR = path.join(tempDir, 'src/languages');
        EN_PATH = path.join(LANGUAGES_DIR, 'en.ts');
        IT_PATH = path.join(LANGUAGES_DIR, 'it.ts');
        fs.mkdirSync(LANGUAGES_DIR, {recursive: true});

        // Patch env to redirect script to temp path
        process.env.LANGUAGES_DIR = LANGUAGES_DIR;

        // Set dry-run flag for tests
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it'];
    });

    afterEach(() => {
        fs.rmSync(LANGUAGES_DIR, {recursive: true, force: true});
        delete process.env.LANGUAGES_DIR;
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.argv = ORIGINAL_ARGV;
        jest.restoreAllMocks();
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
                const strings = {
                    [\`hello\`]: 'world',
                };
                const moreStrings = {
                    [\`key\${strings.hello}\`]: 'more',
                };
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
                const strings = {
                    [\`hello\`]: '[it] world',
                };
                const moreStrings = {
                    [\`key\${strings.hello}\`]: '[it] more',
                };
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

    it('unescapes unicode', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    hello: 'こんにちは',
                    world: 'world',
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
                    hello: '[it] こんにちは',
                    world: '[it] world',
                };
                export default strings;
            `)}`,
        );
    });

    it('reuses existing translations from --compare-ref', async () => {
        // Step 1: simulate an old version with initial translations
        const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-old-'));
        const oldItPath = path.join(oldDir, 'src/languages/it.ts');
        const oldEnPath = path.join(oldDir, 'src/languages/en.ts');
        fs.mkdirSync(path.dirname(oldItPath), {recursive: true});

        fs.writeFileSync(
            oldEnPath,
            dedent(`
            const strings = {
                greeting: 'Hello',
                unchanged: 'Unchanged',
                func: (name: string) => \`Hello \${name}\`,
                noSubstitutionTemplate: \`Salutations\`,
                complexFunc: (numScanning: number, numPending: number) => {
                    const statusText: string[] = [];
                    if (numScanning > 0) {
                        statusText.push(\`\${numScanning} scanning\`);
                    }
                    if (numPending > 0) {
                        statusText.push(\`\${numPending} pending\`);
                    }
                    return statusText.length > 0 ? \`1 expense (\${statusText.join(', ')})\` : '1 expense';
                },
                extraComplex: (payer: string) => \`\${payer ? \`\${payer} as payer \` : ''}paid elsewhere\`,
            };
            export default strings;
        `),
            'utf8',
        );
        fs.writeFileSync(
            oldItPath,
            dedent(`
            import type en from './en';
            const strings = {
                greeting: '[it] Hello',
                unchanged: '[it] Unchanged',
                func: (name: string) => \`[it] Hello \${name}\`,
                noSubstitutionTemplate: \`[it] Salutations\`,
                complexFunc: (numScanning: number, numPending: number) => {
                    const statusText: string[] = [];
                    if (numScanning > 0) {
                        statusText.push(\`[it] \${numScanning} scanning\`);
                    }
                    if (numPending > 0) {
                        statusText.push(\`[it] \${numPending} pending\`);
                    }
                    return statusText.length > 0 ? \`[it] 1 expense (\${statusText.join(', ')})\` : '[it] 1 expense';
                },
                extraComplex: (payer: string) => \`[it] \${payer ? \`[it] \${payer} as payer \` : ''}paid elsewhere\`,
            };
            export default strings;
        `),
            'utf8',
        );

        // Step 2: patch GitHubUtils.getFileContents to load from disk
        jest.spyOn(GitHubUtils, 'getFileContents').mockImplementation((filePath: string) => {
            if (filePath.endsWith('en.ts')) {
                return Promise.resolve(fs.readFileSync(oldEnPath, 'utf8'));
            }
            if (filePath.endsWith('it.ts')) {
                return Promise.resolve(fs.readFileSync(oldItPath, 'utf8'));
            }
            throw new Error(`Unexpected filePath: ${filePath}`);
        });

        // Step 3: create new source with one changed and one unchanged string
        fs.writeFileSync(
            EN_PATH,
            dedent(`
            const strings = {
                greeting: 'Hello',
                unchanged: 'Unchanged',
                func: (name: string) => \`Hello \${name}\`,
                noSubstitutionTemplate: \`Salutations\`,
                complexFunc: (numScanning: number, numPending: number) => {
                    const statusText: string[] = [];
                    if (numScanning > 0) {
                        statusText.push(\`\${numScanning} scanning\`);
                    }
                    if (numPending > 0) {
                        statusText.push(\`\${numPending} pending\`);
                    }
                    return statusText.length > 0 ? \`1 expense (\${statusText.join(', ')})\` : '1 expense';
                },
                extraComplex: (payer: string) => \`\${payer ? \`\${payer} as payer \` : ''}paid elsewhere\`,
                newKey: 'New value!',
            };
            export default strings;
        `),
            'utf8',
        );

        process.argv.push('--compare-ref=ref-does-not-matter-due-to-mock');
        const translateSpy = jest.spyOn(Translator.prototype, 'translate');

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        expect(itContent).toContain('[it] Hello');
        expect(itContent).toContain('[it] Unchanged');
        // eslint-disable-next-line no-template-curly-in-string
        expect(itContent).toContain('[it] Hello ${name}');
        expect(itContent).toContain('[it] Salutations');
        expect(itContent).toContain('[it] New value!');
        expect(translateSpy).toHaveBeenCalledTimes(1);
        expect(translateSpy).toHaveBeenCalledWith('it', 'New value!', undefined);

        fs.rmSync(oldDir, {recursive: true});
    });

    it('translates only specified paths when --paths is provided', async () => {
        const strings = {
            greeting: 'Hello',
            farewell: 'Goodbye',
            common: {
                save: 'Save',
                cancel: 'Cancel',
            },
            errors: {
                generic: 'An error occurred',
                network: 'Network error',
            },
        };
        mockEn = strings;

        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = ${JSON.stringify(strings)};
                export default strings;
            `),
            'utf8',
        );

        // Override process.argv to specify only certain paths
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save,errors.generic'];

        const translateSpy = jest.spyOn(Translator.prototype, 'translate');

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        // Only the specified paths should be translated
        expect(itContent).toContain('[it] Save');
        expect(itContent).toContain('[it] An error occurred');

        // Other paths should not be translated
        expect(itContent).not.toContain('[it] Hello');
        expect(itContent).not.toContain('[it] Goodbye');
        expect(itContent).not.toContain('[it] Cancel');
        expect(itContent).not.toContain('[it] Network error');

        expect(translateSpy).toHaveBeenCalledTimes(2);
        expect(translateSpy).toHaveBeenCalledWith('it', 'Save', undefined);
        expect(translateSpy).toHaveBeenCalledWith('it', 'An error occurred', undefined);
    });

    it('translates nested paths when parent path is specified', async () => {
        const strings = {
            greeting: 'Hello',
            common: {
                save: 'Save',
                cancel: 'Cancel',
                nested: {
                    deep: 'Deep value',
                },
            },
            errors: {
                generic: 'An error occurred',
            },
        };

        mockEn = strings;

        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = ${JSON.stringify(strings)};
                export default strings;
            `),
            'utf8',
        );

        // Override process.argv to specify parent path
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common'];

        const translateSpy = jest.spyOn(Translator.prototype, 'translate');

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        // All nested paths under 'common' should be translated
        expect(itContent).toContain('[it] Save');
        expect(itContent).toContain('[it] Cancel');
        expect(itContent).toContain('[it] Deep value');

        // Other paths should not be translated
        expect(itContent).not.toContain('[it] Hello');
        expect(itContent).not.toContain('[it] An error occurred');

        expect(translateSpy).toHaveBeenCalledTimes(3);
        expect(translateSpy).toHaveBeenCalledWith('it', 'Save', undefined);
        expect(translateSpy).toHaveBeenCalledWith('it', 'Cancel', undefined);
        expect(translateSpy).toHaveBeenCalledWith('it', 'Deep value', undefined);
    });

    it('ignores --compare-ref when --paths is provided', async () => {
        const strings = {
            greeting: 'Hello',
            common: {
                save: 'Save',
            },
        };
        mockEn = strings;

        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = ${JSON.stringify(strings)};
                export default strings;
            `),
            'utf8',
        );

        // Override process.argv to specify both paths and compare-ref
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save', '--compare-ref', 'main'];

        const translateSpy = jest.spyOn(Translator.prototype, 'translate');
        const githubSpy = jest.spyOn(GitHubUtils, 'getFileContents');

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        // Only the specified path should be translated
        expect(itContent).toContain('[it] Save');
        expect(itContent).not.toContain('[it] Hello');

        // GitHubUtils.getFileContents should not be called since --compare-ref is ignored
        expect(githubSpy).not.toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalledTimes(1);
        expect(translateSpy).toHaveBeenCalledWith('it', 'Save', undefined);
    });

    it('throws error for invalid paths', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    greeting: 'Hello',
                    common: {
                        save: 'Save',
                    },
                };
                export default strings;
            `),
            'utf8',
        );

        // Override process.argv to specify a non-existent path
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'nonexistent.path'];

        // Expect the script to throw an error during CLI parsing
        await generateTranslations();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid value for --paths: found the following invalid paths: ["nonexistent.path"]');
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('validates paths against actual translation structure', async () => {
        const strings = {
            greeting: 'Hello',
            common: {
                save: 'Save',
            },
            errors: {
                generic: 'An error occurred',
            },
        };
        mockEn = strings;

        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = ${JSON.stringify(strings)};
                export default strings;
            `),
            'utf8',
        );

        // Test that valid paths work
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'greeting,common.save'];

        const translateSpy = jest.spyOn(Translator.prototype, 'translate');

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        // Should translate the specified paths
        expect(itContent).toContain('[it] Hello');
        expect(itContent).toContain('[it] Save');

        // Should not translate other paths
        expect(itContent).not.toContain('[it] Cancel');
        expect(itContent).not.toContain('[it] An error occurred');

        expect(translateSpy).toHaveBeenCalledTimes(2);
    });

    it('should preserve existing translations for paths not specified in --paths', async () => {
        const strings = {
            greeting: 'Hello',
            farewell: 'Goodbye',
            common: {
                save: 'Save',
                cancel: 'Cancel',
            },
            errors: {
                generic: 'An error occurred',
                network: 'Network error',
            },
            simpleTemplate: (name: string) => `Welcome ${name} to our app`,
        };
        mockEn = strings;

        // Create English source file
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = ${JSON.stringify(strings)};
                export default strings;
            `),
            'utf8',
        );

        // Create an existing Italian translation file with all strings already translated
        fs.writeFileSync(
            IT_PATH,
            dedent(`
                import type en from './en';

                const strings = {
                    greeting: '[it] Hello (existing)',
                    farewell: '[it] Goodbye (existing)',
                    common: {
                        save: '[it] Save (existing)',
                        cancel: '[it] Cancel (existing)',
                    },
                    errors: {
                        generic: '[it] An error occurred (existing)',
                        network: '[it] Network error (existing)',
                    },
                    // eslint-disable-next-line no-template-curly-in-string
                    simpleTemplate: (name: string) => \`[it] Welcome \${name} to our app (existing)\`,
                };
                export default strings;
            `),
            'utf8',
        );

        // Only retranslate specific paths - the bug is that existing translations get lost
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save,errors.generic'];

        await generateTranslations();
        const itContent = fs.readFileSync(IT_PATH, 'utf8');

        // Specified paths should be retranslated (lose the "(existing)" suffix)
        expect(itContent).toContain('[it] Save');
        expect(itContent).toContain('[it] An error occurred');
        expect(itContent).not.toContain('[it] Save (existing)');
        expect(itContent).not.toContain('[it] An error occurred (existing)');

        // BUG: Existing translations for paths NOT in filter should be preserved
        expect(itContent).toContain('[it] Hello (existing)');
        expect(itContent).toContain('[it] Goodbye (existing)');
        expect(itContent).toContain('[it] Cancel (existing)');
        expect(itContent).toContain('[it] Network error (existing)');
        // eslint-disable-next-line no-template-curly-in-string
        expect(itContent).toContain('[it] Welcome ${name} to our app (existing)');

        // Should NOT contain English versions (which would indicate the bug)
        expect(itContent).not.toContain("greeting: 'Hello'");
        expect(itContent).not.toContain("farewell: 'Goodbye'");
        expect(itContent).not.toContain("cancel: 'Cancel'");
        expect(itContent).not.toContain("network: 'Network error'");
        // eslint-disable-next-line no-template-curly-in-string
        expect(itContent).not.toContain('Welcome ${name} to our app');
    });

    it('can handle structural differences between files for incremental translation', async () => {
        // Step 1: Create old version with initial translations
        const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-old-'));
        const oldItPath = path.join(oldDir, 'src/languages/it.ts');
        const oldEnPath = path.join(oldDir, 'src/languages/en.ts');
        const oldFrPath = path.join(oldDir, 'src/languages/fr.ts');
        fs.mkdirSync(path.dirname(oldItPath), {recursive: true});

        // Old English version with specific structure
        fs.writeFileSync(
            oldEnPath,
            dedent(`
                import CONST from '@src/CONST';

                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye',
                    common: {
                        save: 'Save',
                        cancel: 'Cancel',
                    },
                };
                export default strings;
            `),
            'utf8',
        );

        // Old Italian translation
        fs.writeFileSync(
            oldItPath,
            dedent(`
                import type en from './en';

                const strings = {
                    greeting: '[it] Hello',
                    farewell: '[it] Goodbye', 
                    common: {
                        save: '[it] Save',
                        cancel: '[it] Cancel',
                    },
                };
                export default strings;
            `),
            'utf8',
        );

        // Old French translation with significantly different structure that breaks parallel traversal
        fs.writeFileSync(
            oldFrPath,
            dedent(`
                import type en from './en';
                import {someHelper} from '@libs/SomeHelper';

                // Extra comment that shifts the AST structure
                const helperFunction = () => 'helper';

                const strings = {
                    greeting: '[fr] Hello',
                    farewell: '[fr] Goodbye',
                    // Extra property that doesn't exist in other files
                    extraProp: '[fr] Extra',
                    common: {
                        save: '[fr] Save',
                        cancel: '[fr] Cancel',
                    },
                };
                export default strings;
            `),
            'utf8',
        );

        // Step 2: Mock GitHubUtils to return the old files
        jest.spyOn(GitHubUtils, 'getFileContents').mockImplementation((filePath: string) => {
            if (filePath.endsWith('en.ts')) {
                return Promise.resolve(fs.readFileSync(oldEnPath, 'utf8'));
            }
            if (filePath.endsWith('it.ts')) {
                return Promise.resolve(fs.readFileSync(oldItPath, 'utf8'));
            }
            if (filePath.endsWith('fr.ts')) {
                return Promise.resolve(fs.readFileSync(oldFrPath, 'utf8'));
            }
            throw new Error(`Unexpected filePath: ${filePath}`);
        });

        // Step 3: Create new English source with one new string
        const newStrings = {
            greeting: 'Hello',
            farewell: 'Goodbye',
            common: {
                save: 'Save',
                cancel: 'Cancel',
            },
            newKey: 'New value!',
        };
        mockEn = newStrings;

        fs.writeFileSync(
            EN_PATH,
            dedent(`
                import CONST from '@src/CONST';

                const strings = {
                    greeting: 'Hello',
                    farewell: 'Goodbye',
                    common: {
                        save: 'Save',
                        cancel: 'Cancel',
                    },
                    newKey: 'New value!',
                };
                export default strings;
            `),
            'utf8',
        );

        // Step 4: Run translation with compare-ref
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it,fr', '--compare-ref=ref-does-not-matter-due-to-mock'];

        const translateSpy = jest.spyOn(Translator.prototype, 'translate');

        await generateTranslations();

        const itContent = fs.readFileSync(IT_PATH, 'utf8');
        const frContent = fs.readFileSync(path.join(LANGUAGES_DIR, 'fr.ts'), 'utf8');

        // BUG: Due to structural differences in the old files, parallel AST traversal gets out of sync
        // This should result in inconsistent behavior between IT and FR files

        // Both files should preserve existing translations
        expect(itContent).toContain('[it] Hello');
        expect(itContent).toContain('[it] Goodbye');
        expect(itContent).toContain('[it] Save');
        expect(itContent).toContain('[it] Cancel');

        expect(frContent).toContain('[fr] Hello');
        expect(frContent).toContain('[fr] Goodbye');
        expect(frContent).toContain('[fr] Save');
        expect(frContent).toContain('[fr] Cancel');

        // Both should have the new translation
        expect(itContent).toContain('[it] New value!');
        expect(frContent).toContain('[fr] New value!');

        // Only the new string should have been translated
        expect(translateSpy).toHaveBeenCalledTimes(2); // Once for IT, once for FR
        expect(translateSpy).toHaveBeenCalledWith('it', 'New value!', undefined);
        expect(translateSpy).toHaveBeenCalledWith('fr', 'New value!', undefined);

        fs.rmSync(oldDir, {recursive: true});
    });

    it('validates compare-ref is a valid git reference', async () => {
        fs.writeFileSync(
            EN_PATH,
            dedent(`
                const strings = {
                    greeting: 'Hello',
                };
                export default strings;
            `),
            'utf8',
        );

        // Test with invalid git reference
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'invalid-ref-that-does-not-exist'];

        // Expect the script to throw an error during CLI parsing
        await generateTranslations();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Invalid value for --compare-ref: Invalid git reference: "invalid-ref-that-does-not-exist". Please provide a valid branch, tag, or commit hash.',
        );
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });
});
