/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import dedent from '@libs/StringUtils/dedent';
import generateTranslations, {GENERATED_FILE_PREFIX} from '@scripts/generateTranslations';
import Git from '@scripts/utils/Git';
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
jest.mock('@scripts/utils/Git');

// Mock Git methods
const mockIsValidRef = jest.fn();
const mockDiff = jest.fn();
const mockShow = jest.fn();

// Apply mocks to Git using jest.spyOn (ignore type errors for now)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
jest.spyOn(Git as any, 'isValidRef').mockImplementation(mockIsValidRef);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
jest.spyOn(Git as any, 'diff').mockImplementation(mockDiff);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
jest.spyOn(Git as any, 'show').mockImplementation(mockShow);

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

        // Reset Git mocks to default behavior for each test
        mockIsValidRef.mockReset();
        mockDiff.mockReset();
        mockShow.mockReset();

        // Default to invalid ref unless explicitly mocked otherwise
        mockIsValidRef.mockReturnValue(false);
        mockDiff.mockReturnValue({files: [], hasChanges: false});
        mockShow.mockImplementation(() => {
            throw new Error('Git show not mocked for this test');
        });
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

    describe('full translations', () => {
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
    });

    describe('incremental translations', () => {
        it('reuses existing translations from --compare-ref with git diff', async () => {
            // Create English source with one new string
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

            // Create existing Italian translation without the new key
            fs.writeFileSync(
                IT_PATH,
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

            // Mock Git.diff to show only the new key was added
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([17]), // Line with newKey
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve all existing translations
            expect(itContent).toContain('[it] Hello');
            expect(itContent).toContain('[it] Unchanged');
            // eslint-disable-next-line no-template-curly-in-string
            expect(itContent).toContain('[it] Hello ${name}');
            expect(itContent).toContain('[it] Salutations');

            // Should add the new translation
            expect(itContent).toContain('[it] New value!');

            // Should only translate the new string
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'New value!', undefined);
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

            // Create existing Italian translation file with some existing translations
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    greeting: '[it] Hello',
                    farewell: '[it] Goodbye',
                    common: {
                        save: '[it] Old Save Translation',
                        cancel: '[it] Cancel',
                    },
                    errors: {
                        generic: '[it] Old Error Translation',
                        network: '[it] Network error',
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Override process.argv to specify only certain paths
            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save,errors.generic'];

            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Only the specified paths should be retranslated with new translations
            expect(itContent).toContain('[it] Save'); // Should be retranslated
            expect(itContent).toContain('[it] An error occurred'); // Should be retranslated

            // Other paths should remain unchanged from their existing translations
            expect(itContent).toContain('[it] Hello'); // Should remain unchanged
            expect(itContent).toContain('[it] Goodbye'); // Should remain unchanged
            expect(itContent).toContain('[it] Cancel'); // Should remain unchanged
            expect(itContent).toContain('[it] Network error'); // Should remain unchanged

            // Old translations should be replaced
            expect(itContent).not.toContain('[it] Old Save Translation');
            expect(itContent).not.toContain('[it] Old Error Translation');

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

            // Create existing Italian translation file
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    greeting: '[it] Hello (existing)',
                    common: {
                        save: '[it] Save (existing)',
                        cancel: '[it] Cancel (existing)',
                        nested: {
                            deep: '[it] Deep value (existing)',
                        },
                    },
                    errors: {
                        generic: '[it] An error occurred (existing)',
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Override process.argv to specify parent path
            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common'];

            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // All nested paths under 'common' should be retranslated
            expect(itContent).toContain('[it] Save');
            expect(itContent).toContain('[it] Cancel');
            expect(itContent).toContain('[it] Deep value');

            // Other paths should remain unchanged from existing translations
            expect(itContent).toContain('[it] Hello (existing)');
            expect(itContent).toContain('[it] An error occurred (existing)');

            // Old translations should be replaced
            expect(itContent).not.toContain('[it] Save (existing)');
            expect(itContent).not.toContain('[it] Cancel (existing)');
            expect(itContent).not.toContain('[it] Deep value (existing)');

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

            // Create existing Italian translation file
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    greeting: '[it] Hello (existing)',
                    common: {
                        save: '[it] Save (existing)',
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Override process.argv to specify both paths and compare-ref
            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save', '--compare-ref', 'main'];

            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Only the specified path should be retranslated
            expect(itContent).toContain('[it] Save');

            // Other paths should remain unchanged
            expect(itContent).toContain('[it] Hello (existing)');

            // Old translation should be replaced
            expect(itContent).not.toContain('[it] Save (existing)');

            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Save', undefined);
        });

        it('throws error when target file does not exist for --paths', async () => {
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

            // Don't create IT_PATH - this should cause an error

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'common.save'];

            await expect(generateTranslations()).rejects.toThrow('Target file');
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

            // Create existing Italian translation file
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    greeting: '[it] Hello (existing)',
                    common: {
                        save: '[it] Save (existing)',
                    },
                    errors: {
                        generic: '[it] An error occurred (existing)',
                    },
                };
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

            // Should not translate other paths - should preserve existing translations
            expect(itContent).toContain('[it] An error occurred (existing)');

            // Should not contain fresh translations of unspecified paths
            expect(itContent).not.toContain('[it] Cancel'); // This path doesn't exist, so shouldn't be added

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
        });

        it('handles incremental translation with multiple target languages', async () => {
            // Create English source
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

            // Create existing Italian translation
            fs.writeFileSync(
                IT_PATH,
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

            // Create existing French translation
            const FR_PATH = path.join(LANGUAGES_DIR, 'fr.ts');
            fs.writeFileSync(
                FR_PATH,
                dedent(`
                    import type en from './en';

                    const strings = {
                        greeting: '[fr] Hello',
                        farewell: '[fr] Goodbye',
                        common: {
                            save: '[fr] Save',
                            cancel: '[fr] Cancel',
                        },
                    };
                    export default strings;
                `),
                'utf8',
            );

            // Mock Git.diff to show one new string added
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([10]), // Line with newKey
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it,fr', '--compare-ref', 'main'];

            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();

            const itContent = fs.readFileSync(IT_PATH, 'utf8');
            const frContent = fs.readFileSync(FR_PATH, 'utf8');

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

        it('handles complex nested templates and ternaries with git diff', async () => {
            // Create English source with complex nested expressions
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    deepTemplate: (user: User, settings: Settings) => \`\${user.isAdmin ? 
                        \`Admin \${user.name}: \${settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}\` : 
                        \`User \${user.name ?? 'Unknown'}: \${settings.notifications ? 'Notifications on' : 'Silent'}\`
                    } - \${settings.language || 'English'}\`,
                    unchanged: 'Keep this'
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing translation
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    deepTemplate: (user: User, settings: Settings) => \`[it] Old complex template\`,
                    unchanged: '[it] Keep this (existing)'
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing template changes
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([2, 3, 4]), // Lines in the complex template
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--locales', 'it', '--compare-ref', 'main'];

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve unchanged string
            expect(itContent).toContain('[it] Keep this (existing)');

            // Should retranslate complex template - check for key parts rather than exact formatting
            expect(itContent).toContain('deepTemplate: (user: User, settings: Settings) =>');
            expect(itContent).toContain('[it] Admin');
            expect(itContent).toContain('[it] Dark mode');
            expect(itContent).toContain('[it] Light mode');
            expect(itContent).toContain('[it] User');
            expect(itContent).toContain('[it] Unknown');
            expect(itContent).toContain('[it] Notifications on');
            expect(itContent).toContain('[it] Silent');
            expect(itContent).toContain('[it] English');
            expect(itContent).toContain('user.isAdmin');
            // eslint-disable-next-line no-template-curly-in-string
            expect(itContent).toContain('${user.name}');
            expect(itContent).toContain("settings.theme === 'dark'");
            expect(itContent).not.toContain('[it] Old complex template');
        });

        it('handles path removal with nested object cleanup', async () => {
            // Create English source with some sections removed
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    keep: {
                        this: 'Keep this section'
                    },
                    modify: {
                        update: 'Updated value'
                    }
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing translation with extra sections that will be removed
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    keep: {
                        this: '[it] Keep this section (existing)'
                    },
                    modify: {
                        update: '[it] Updated value (old)',
                        remove: '[it] Will be removed'
                    },
                    deleteEntire: {
                        gone: '[it] Entire section removed',
                        alsoGone: '[it] Also removed'
                    }
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing modifications and removals
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([6]), // Line with updated value
                        removedLines: new Set([7, 9, 10, 11, 12]), // Lines where sections were removed
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock git show to return the old version of en.ts with the removed sections
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    keep: {
                        this: 'Keep this section'
                    },
                    modify: {
                        update: 'Old value',
                        remove: 'Will be removed'
                    },
                    deleteEntire: {
                        gone: 'Entire section removed',
                        alsoGone: 'Also removed'
                    }
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--locales', 'it', '--compare-ref', 'main'];

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve unchanged sections
            expect(itContent).toContain('[it] Keep this section (existing)');

            // Should retranslate modified paths
            expect(itContent).toContain('[it] Updated value');
            expect(itContent).not.toContain('[it] Updated value (old)');

            // Should remove deleted paths and clean up empty parent objects
            expect(itContent).not.toContain('remove');
            expect(itContent).not.toContain('deleteEntire');
            expect(itContent).not.toContain('gone');
            expect(itContent).not.toContain('alsoGone');
        });

        it('handles adding new nested sections with --compare-ref', async () => {
            // Create English source with a completely new nested section
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    existingSection: {
                        keep: 'Keep this existing translation',
                    },
                    // New nested section that doesn't exist in target file yet
                    manualTest: {
                        simple: 'Save',
                        templateSimple: (name: string) => \`Hello \${name}\`,
                        deepTemplate: (user: {name?: string; isAdmin: boolean}, settings: {theme: 'dark' | 'light'}) =>
                            \`\${user.isAdmin ? \`Admin \${user.name}: \${settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}\` : \`User \${user.name ?? 'Unknown'}\`}\`,
                        typed: (n: number): string => 'Typed output',
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation WITHOUT the manualTest section
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    existingSection: {
                        keep: '[it] Keep this existing translation',
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock Git.diff to show the new nested section was added
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([6, 7, 8, 9, 10, 11, 12]), // Lines with the new manualTest section
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve existing translations
            expect(itContent).toContain('[it] Keep this existing translation');

            // BUG: Should add the new nested translations, but currently they are missing
            expect(itContent).toContain('manualTest: {');
            expect(itContent).toContain('[it] Save');
            // eslint-disable-next-line no-template-curly-in-string
            expect(itContent).toContain('[it] Hello ${name}');
            expect(itContent).toContain('[it] Admin');
            expect(itContent).toContain('[it] Dark mode');
            expect(itContent).toContain('[it] Light mode');
            expect(itContent).toContain('[it] User');
            expect(itContent).toContain('[it] Unknown');
            expect(itContent).toContain('[it] Typed output');

            // Should translate the new strings
            expect(translateSpy).toHaveBeenCalledWith('it', 'Save', undefined);
            // eslint-disable-next-line no-template-curly-in-string
            expect(translateSpy).toHaveBeenCalledWith('it', 'Hello ${name}', undefined);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Typed output', undefined);
        });

        it('handles adding new properties to existing nested structures with --compare-ref', async () => {
            // Create English source with existing nested structure and a new property added to it
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    existingSection: {
                        keep: 'Keep this existing translation',
                    },
                    some: {
                        nested: {
                            existingProp: 'Existing nested value',
                            newPath: 'New value added to existing nested structure',
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation with the nested structure but WITHOUT the new property
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    existingSection: {
                        keep: '[it] Keep this existing translation',
                    },
                    some: {
                        nested: {
                            existingProp: '[it] Existing nested value',
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock Git.diff to show only the new property was added
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([8]), // Line with the new property
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve all existing translations
            expect(itContent).toContain('[it] Keep this existing translation');
            expect(itContent).toContain('[it] Existing nested value');

            // Should add the new property to the existing nested structure
            expect(itContent).toContain('some: {');
            expect(itContent).toContain('nested: {');
            expect(itContent).toContain("existingProp: '[it] Existing nested value'");
            expect(itContent).toContain("newPath: '[it] New value added to existing nested structure'");

            // Should only translate the new string
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'New value added to existing nested structure', undefined);
        });

        it('handles modifying existing string values with --compare-ref', async () => {
            // Create English source with a modified string value
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    testDrive: {
                        modal: {
                            helpText: 'Skip it if you dare',
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation with the old value
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    testDrive: {
                        modal: {
                            helpText: '[it] Skip',
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock Git.diff to show the string was modified
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set(),
                        removedLines: new Set(),
                        modifiedLines: new Set([4]), // Line with the modified string
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version of en.ts
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    testDrive: {
                        modal: {
                            helpText: 'Skip',
                        },
                    },
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should update the modified string
            expect(itContent).toContain('[it] Skip it if you dare');
            // The old translation should be replaced, not preserved
            expect(itContent).not.toContain("helpText: '[it] Skip',");

            // Should translate the modified string
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Skip it if you dare', undefined);
        });

        it('should handle string concatenation expressions', async () => {
            const strings = {
                onboarding: {
                    tasks: {
                        inviteTeamTask: {
                            title: 'Simple title',
                            description: 'First part & Second part',
                        },
                    },
                },
            };
            mockEn = strings;

            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    onboarding: {
                        tasks: {
                            inviteTeamTask: {
                                title: 'Simple title',
                                description: 'First part' + ' & ' + 'Second part',
                            },
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing translation file
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    onboarding: {
                        tasks: {
                            inviteTeamTask: {
                                title: '[it] Simple title (old)',
                                description: '[it] First part & Second part (old)',
                            },
                        },
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'onboarding.tasks.inviteTeamTask'];

            await generateTranslations();

            const result = fs.readFileSync(IT_PATH, 'utf8');

            // Both title and description should be translated
            expect(result).toContain('[it] Simple title');
            // Each part of the string concatenation should be translated individually
            expect(result).toContain('[it] First part');
            expect(result).toContain('[it] Second part');
        });

        it('should handle satisfies expressions in nested objects', async () => {
            const strings = {
                common: {
                    tasks: 'Tasks', // String value
                },
                onboarding: {
                    tasks: {
                        createWorkspaceTask: {
                            title: 'Create a workspace',
                            description: 'Create a workspace to get started',
                        },
                    },
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

            // Create existing translation file with satisfies expression on nested object
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    common: {
                        tasks: '[it] Tasks',
                    },
                    onboarding: {
                        tasks: {
                            someOtherTask: {
                                title: '[it] Some other task',
                                description: '[it] Some other description',
                            },
                        } satisfies Record<string, {title: string; description: string}>,
                    },
                };
                export default strings;
            `),
                'utf8',
            );

            // Test targeting the specific nested path
            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--paths', 'onboarding.tasks.createWorkspaceTask'];

            // This currently throws an error but should succeed
            await generateTranslations();

            // Check that the new task was added within the satisfies expression
            const result = fs.readFileSync(IT_PATH, 'utf8');
            expect(result).toContain('createWorkspaceTask');
            expect(result).toContain('[it] Create a workspace');
            expect(result).toContain('satisfies Record<'); // Should preserve the satisfies expression
        });

        it('detects modifications when only a context annotation is added with --compare-ref', async () => {
            // Create English source with a context annotation on one translation
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // @context as a verb, not a noun
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation without the context annotation
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    unchanged: '[it] This stays the same',
                    pin: '[it] Pin',
                    alsoUnchanged: '[it] Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing only the comment line was added (line 3)
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([3]), // Only the context comment line
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version without the context annotation
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve unchanged translations
            expect(itContent).toContain('[it] This stays the same');
            expect(itContent).toContain('[it] Also unchanged');

            // BUG: The 'pin' translation should be retranslated with the new context
            // The translation should now include the context indicator
            expect(itContent).toContain('[it][ctx: as a verb, not a noun] Pin');

            // Should translate the string with the new context
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Pin', 'as a verb, not a noun');
        });

        it('detects modifications when a context annotation is changed with --compare-ref', async () => {
            // Create English source with a modified context annotation
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // @context as a verb, not a noun
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation with the old context
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    unchanged: '[it] This stays the same',
                    // @context original context
                    pin: '[it][ctx: original context] Pin',
                    alsoUnchanged: '[it] Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing the context comment line was modified
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([3]), // New context comment
                        removedLines: new Set([3]), // Old context comment on same line in old version
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version with different context
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // @context original context
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve unchanged translations
            expect(itContent).toContain('[it] This stays the same');
            expect(itContent).toContain('[it] Also unchanged');

            // Should retranslate with new context
            expect(itContent).toContain('[it][ctx: as a verb, not a noun] Pin');
            expect(itContent).not.toContain('[it][ctx: original context] Pin');

            // Should translate the string with the new context
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Pin', 'as a verb, not a noun');
        });

        it('detects modifications when a context annotation is removed with --compare-ref', async () => {
            // Update mockEn to match the test data
            const strings = {
                unchanged: 'This stays the same',
                pin: 'Pin',
                alsoUnchanged: 'Also unchanged',
            };
            mockEn = strings;

            // Create English source without context annotation
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation with context
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    unchanged: '[it] This stays the same',
                    // @context as a verb, not a noun
                    pin: '[it][ctx: as a verb, not a noun] Pin',
                    alsoUnchanged: '[it] Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing the context comment line was removed
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set(),
                        removedLines: new Set([3]), // Context comment removed
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version with context
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // @context as a verb, not a noun
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve unchanged translations
            expect(itContent).toContain('[it] This stays the same');
            expect(itContent).toContain('[it] Also unchanged');

            // Should retranslate without context (no context indicator in translation)
            expect(itContent).toContain("pin: '[it] Pin'");
            expect(itContent).not.toContain('[it][ctx: as a verb, not a noun] Pin');

            // Should translate the string without context
            expect(translateSpy).toHaveBeenCalledTimes(1);
            expect(translateSpy).toHaveBeenCalledWith('it', 'Pin', undefined);

            // The context comment should not be in the output
            expect(itContent).not.toContain('// @context as a verb, not a noun');
        });

        it('does NOT trigger retranslation when only a regular comment is added with --compare-ref', async () => {
            // Create English source with a regular comment
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // This is just a regular comment
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation without any comment
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    unchanged: '[it] This stays the same',
                    pin: '[it] Pin (existing)',
                    alsoUnchanged: '[it] Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing only the regular comment line was added
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([3]), // Regular comment line
                        removedLines: new Set(),
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version without the comment
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve all existing translations unchanged
            expect(itContent).toContain('[it] This stays the same');
            expect(itContent).toContain('[it] Pin (existing)');
            expect(itContent).toContain('[it] Also unchanged');

            // Should NOT retranslate since it's just a regular comment
            expect(translateSpy).not.toHaveBeenCalled();
        });

        it('does NOT trigger retranslation when a regular comment is modified with --compare-ref', async () => {
            // Create English source with a modified regular comment
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // TODO: update this translation later
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Create existing Italian translation with different regular comment
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                import type en from './en';
                const strings = {
                    unchanged: '[it] This stays the same',
                    // TODO: fix this
                    pin: '[it] Pin (existing)',
                    alsoUnchanged: '[it] Also unchanged',
                };
                export default strings;
            `),
                'utf8',
            );

            // Mock git diff showing the regular comment was modified
            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([3]), // Modified comment
                        removedLines: new Set([3]), // Old comment
                        modifiedLines: new Set(),
                    },
                ],
                hasChanges: true,
            });

            // Mock Git.show to return the old version with old comment
            mockShow.mockReturnValue(
                dedent(`
                const strings = {
                    unchanged: 'This stays the same',
                    // TODO: fix this
                    pin: 'Pin',
                    alsoUnchanged: 'Also unchanged',
                };
                export default strings;
            `),
            );

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // Should preserve all existing translations unchanged
            expect(itContent).toContain('[it] This stays the same');
            expect(itContent).toContain('[it] Pin (existing)');
            expect(itContent).toContain('[it] Also unchanged');

            // Should NOT retranslate since it's just a regular comment change
            expect(translateSpy).not.toHaveBeenCalled();
        });

        it('works with multiline dedent template strings', async () => {
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                import dedent from '@libs/StringUtils/dedent';

                const strings = {
                    codesLoseAccess: dedent(\`
                        If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

                            1. Sometimes we have further indentation
                            2. With bulleted lists and such

                        Note: Setting up two-factor authentication will log you out of all other active sessions.
                    \`),
                };

                export default strings;
            `),
                'utf8',
            );

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            // The translated output should preserve the dedent structure with proper indentation on empty lines
            // The empty line between the two paragraphs should have the same indentation as the content lines
            const expectedFormat = `codesLoseAccess: dedent(\`
        [it] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            1. Sometimes we have further indentation
            2. With bulleted lists and such

        Note: Setting up two-factor authentication will log you out of all other active sessions.
    \`),`;
            expect(itContent).toContain(expectedFormat);
        });

        it('works with simple template expressions in dedent calls', async () => {
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                import dedent from '@libs/StringUtils/dedent';

                const strings = {
                    welcomeMessage: (name: string, company: string) =>
                        dedent(\`
                            Welcome to \${company}, \${name}!

                            We're excited to have you here.
                        \`),
                };

                export default strings;
            `),
                'utf8',
            );

            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');

            expect(itContent).toContain(`
    welcomeMessage: (name: string, company: string) =>
        dedent(\`
            [it] Welcome to \${company}, \${name}!

            We're excited to have you here.
        \`),`);
        });

        it('does not retranslate unchanged nested properties when nearby properties are modified', async () => {
            // This test reproduces a bug where unchanged properties get incorrectly
            // flagged as changed when nearby properties are modified and cause line number shifts

            // OLD file (before changes) - line numbers before dedent():
            // 1: const strings = {
            // 2:     prop1: 'First property',
            // 3:     prop2: 'Second property',
            // 4:     prop3: 'Third property',
            // 5: };
            // 6: export default strings;
            const oldEnContent = dedent(`
                const strings = {
                    prop1: 'First property',
                    prop2: 'Second property',
                    prop3: 'Third property',
                };
                export default strings;
            `);

            // NEW file (after changes) - line numbers after dedent():
            // 1: import dedent from '@libs/StringUtils/dedent';
            // 2: (empty line)
            // 3: const strings = {
            // 4:     prop1: dedent(`
            // 5:         First property
            // 6:     `),
            // 7:     prop2: 'Second property',
            // 8:     prop3: 'Third property',
            // 9: };
            // 10: export default strings;
            //
            // Only prop1 was actually changed (single-line -> dedent multi-line)
            // prop2 and prop3 are unchanged, just shifted to new line numbers
            fs.writeFileSync(
                EN_PATH,
                dedent(`
                    import dedent from '@libs/StringUtils/dedent';

                    const strings = {
                        prop1: dedent(\`
                            First property
                        \`),
                        prop2: 'Second property',
                        prop3: 'Third property',
                    };
                    export default strings;
                `),
                'utf8',
            );

            // Existing Italian translation (all properties already translated)
            fs.writeFileSync(
                IT_PATH,
                dedent(`
                    import dedent from '@libs/StringUtils/dedent';
                    import type en from './en';

                    const strings = {
                        prop1: '[it] First property',
                        prop2: '[it] Second property',
                        prop3: '[it] Third property',
                    };
                    export default strings;
                `),
                'utf8',
            );

            mockIsValidRef.mockReturnValue(true);
            mockDiff.mockReturnValue({
                files: [
                    {
                        filePath: 'src/languages/en.ts',
                        hunks: [],
                        addedLines: new Set([1, 2, 5, 6]), // Import, empty, dedent middle/end
                        removedLines: new Set([2]), // Old line 2: prop1: 'First property',
                        modifiedLines: new Set([4]), // NEW line 4 (dedent opening) paired with OLD line 2
                    },
                ],
                hasChanges: true,
            });

            mockShow.mockReturnValue(oldEnContent);

            process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--verbose', '--locales', 'it', '--compare-ref', 'main'];
            const translateSpy = jest.spyOn(Translator.prototype, 'translate');

            await generateTranslations();

            // Only prop1 should be translated (it actually changed)
            expect(translateSpy).toHaveBeenCalledWith('it', 'First property\n', undefined);

            // prop2 and prop3 should NOT be translated (they didn't change, just moved line numbers)
            // BUG: Due to the bug, these WILL be called, causing this test to FAIL
            expect(translateSpy).not.toHaveBeenCalledWith('it', 'Second property', undefined);
            expect(translateSpy).not.toHaveBeenCalledWith('it', 'Third property', undefined);

            // Verify only 1 translation was requested
            expect(translateSpy).toHaveBeenCalledTimes(1);
        });
    });
});
