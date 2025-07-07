"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment node
 */
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var dedent_1 = require("@libs/StringUtils/dedent");
var generateTranslations_1 = require("../../scripts/generateTranslations");
var Translator_1 = require("../../scripts/utils/Translator/Translator");
jest.mock('openai');
var tempDir;
var LANGUAGES_DIR;
var EN_PATH;
var IT_PATH;
describe('generateTranslations', function () {
    var ORIGINAL_ARGV = process.argv;
    beforeEach(function () {
        tempDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'translations-test-'));
        LANGUAGES_DIR = path_1.default.join(tempDir, 'src/languages');
        EN_PATH = path_1.default.join(LANGUAGES_DIR, 'en.ts');
        IT_PATH = path_1.default.join(LANGUAGES_DIR, 'it.ts');
        fs_1.default.mkdirSync(LANGUAGES_DIR, { recursive: true });
        // Patch env to redirect script to temp path
        process.env.LANGUAGES_DIR = LANGUAGES_DIR;
        // Set dry-run flag for tests
        process.argv = ['ts-node', 'generateTranslations.ts', '--dry-run', '--locales', 'it'];
    });
    afterEach(function () {
        fs_1.default.rmSync(LANGUAGES_DIR, { recursive: true, force: true });
        delete process.env.LANGUAGES_DIR;
        jest.clearAllMocks();
    });
    afterAll(function () {
        process.argv = ORIGINAL_ARGV;
    });
    it('translates nested structures', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    greeting: 'Hello',\n                    farewell: 'Goodbye',\n                    unnecessaryTemplate: `This template contains no spans`,\n                    message: (username: string, count: number) => `Hi ${username}, you have ${count} messages`,\n                    some: {\n                        nested: {\n                            str: 'nested string',\n                            fnc: ({destructuredArg}) => `My template string contains a single ${destructuredArg} argument`,\n                        }\n                    }\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    greeting: '[it] Hello',\n                    farewell: '[it] Goodbye',\n                    unnecessaryTemplate: `[it] This template contains no spans`,\n                    message: (username: string, count: number) => `[it] Hi ${username}, you have ${count} messages`,\n                    some: {\n                        nested: {\n                            str: '[it] nested string',\n                            fnc: ({destructuredArg}) => `[it] My template string contains a single ${destructuredArg} argument`,\n                        },\n                    },\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it("doesn't translate strings or templates used in control flows", function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                import Log from '@libs/Log';\n                import CONST from '@src/CONST';\n\n                if (CONST.REPORT.TYPE.EXPENSE == 'true') {\n                    Log.info('This should not be translated');\n                    console.log('This should not be translated either');\n                }\n                function myFunction(myVariable: string): boolean | string {\n                    if (myVariable === 'Hello world') {\n                        return true;\n                    } else {\n                        switch (myVariable) {\n                            case 'Hello':\n                                return true;\n                            case 'Goodbye':\n                                return false;\n                            default:\n                                return myVariable === 'Goodnight' ? 'Moon' : 'Sun';\n                        }\n                    }\n                }\n                const strings = {\n                    [`hello`]: 'world',\n                };\n                const moreStrings = {\n                    [`key${strings.hello}`]: 'more',\n                };\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import Log from '@libs/Log';\n                import CONST from '@src/CONST';\n                import type en from './en';\n\n                if (CONST.REPORT.TYPE.EXPENSE == 'true') {\n                    Log.info('This should not be translated');\n                    console.log('This should not be translated either');\n                }\n                function myFunction(myVariable: string): boolean | string {\n                    if (myVariable === 'Hello world') {\n                        return true;\n                    } else {\n                        switch (myVariable) {\n                            case 'Hello':\n                                return true;\n                            case 'Goodbye':\n                                return false;\n                            default:\n                                return myVariable === 'Goodnight' ? '[it] Moon' : '[it] Sun';\n                        }\n                    }\n                }\n                const strings = {\n                    [`hello`]: '[it] world',\n                };\n                const moreStrings = {\n                    [`key${strings.hello}`]: '[it] more',\n                };\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it('handles nested template expressions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    simple: (name: string, greeting: string) => `${greeting} good sir ${name}!`,\n                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => `${myParams.greeting} good sir ${myParams.greeting}!`,\n                    complex: (action: {actionName: string}) => `Edit ${action.actionName === 'shouldNotBeTranslated' ? 'expense' : 'comment'}`,\n                    complexWithNullishCoalesce: (name: string) => `Pay ${name ?? 'someone'}`,\n                    complexWithFalsyCoalesce: (name: string) => `Pay ${name || 'someone'}`,\n                    extraComplex: (payer: string) => `${payer ? `${payer} as payer ` : ''}paid elsewhere`,\n                    extraComplexButJustWhitespace: (payer: string) => `${payer ? `${payer} ` : ''}paid elsewhere`,\n                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => `${shouldBeFormal ? 'Salutations' : 'Sup'} ${shouldBeFormal ? `Sir ${name}` : ` ${name}`}}`,\n                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => `${someBool ? `${someOtherBool ? 'Hello' : 'Goodbye'} moon` : 'Goodnight, moon' }, friend`,\n                    tooComplex: (numScanning: number, numPending: number) => {\n                        const statusText: string[] = [];\n                        if (numScanning > 0) {\n                            statusText.push(`${numScanning} scanning`);\n                        }\n                        if (numPending > 0) {\n                            statusText.push(`${numPending} pending`);\n                        }\n                        return statusText.length > 0 ? `1 expense (${statusText.join(', ')})` : '1 expense';\n                    },\n                    unrealisticallyComplex: (numScanning: number, numPending: number) =>\n                        `${(() => {\n                            const statusText: string[] = [];\n                            if (numScanning > 0) {\n                                statusText.push(`${numScanning} scanning`);\n                            }\n                            if (numPending > 0) {\n                                statusText.push(`${numPending} pending`);\n                            }\n                            return statusText.length > 0 ? `1 expense (${statusText.join(', ')})` : '1 expense';\n                        })()} If someone really uses an IIFE in here, then we've got bigger problems.`,\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    simple: (name: string, greeting: string) => `[it] ${greeting} good sir ${name}!`,\n                    simpleWithDotNotation: (myParams: {name: string; greeting: string}) => `[it] ${myParams.greeting} good sir ${myParams.greeting}!`,\n                    complex: (action: {actionName: string}) => `[it] Edit ${action.actionName === 'shouldNotBeTranslated' ? '[it] expense' : '[it] comment'}`,\n                    complexWithNullishCoalesce: (name: string) => `[it] Pay ${name ?? '[it] someone'}`,\n                    complexWithFalsyCoalesce: (name: string) => `[it] Pay ${name || '[it] someone'}`,\n                    extraComplex: (payer: string) => `[it] ${payer ? `[it] ${payer} as payer ` : ''}paid elsewhere`,\n                    extraComplexButJustWhitespace: (payer: string) => `[it] ${payer ? `${payer} ` : ''}paid elsewhere`,\n                    whiteSpaceWithComplexSpans: (shouldBeFormal: string, name: string) => `${shouldBeFormal ? '[it] Salutations' : '[it] Sup'} ${shouldBeFormal ? `[it] Sir ${name}` : ` ${name}`}}`,\n                    evenMoreComplex: (someBool: boolean, someOtherBool: boolean) => `[it] ${someBool ? `[it] ${someOtherBool ? '[it] Hello' : '[it] Goodbye'} moon` : '[it] Goodnight, moon'}, friend`,\n                    tooComplex: (numScanning: number, numPending: number) => {\n                        const statusText: string[] = [];\n                        if (numScanning > 0) {\n                            statusText.push(`[it] ${numScanning} scanning`);\n                        }\n                        if (numPending > 0) {\n                            statusText.push(`[it] ${numPending} pending`);\n                        }\n                        return statusText.length > 0 ? `[it] 1 expense (${statusText.join(', ')})` : '[it] 1 expense';\n                    },\n                    unrealisticallyComplex: (numScanning: number, numPending: number) =>\n                        `[it] ${(() => {\n                            const statusText: string[] = [];\n                            if (numScanning > 0) {\n                                statusText.push(`[it] ${numScanning} scanning`);\n                            }\n                            if (numPending > 0) {\n                                statusText.push(`[it] ${numPending} pending`);\n                            }\n                            return statusText.length > 0 ? `[it] 1 expense (${statusText.join(', ')})` : '[it] 1 expense';\n                        })()} If someone really uses an IIFE in here, then we've got bigger problems.`,\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it('handles repeated ternaries in complex expressions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    updateReportFieldAllOptionsDisabled: (count: number, enabled: boolean, option: string) => {\n                        if (toggledOptionsCount > 1) {\n                            return `${enabled ? 'enabled' : 'disabled'} all options for \"${option}\".`;\n                        }\n                        return `${enabled ? 'enabled' : 'disabled'} the option \"${option}\" for the report field \"${option}\", making all options ${enabled ? 'enabled' : 'disabled'}`;\n                    },\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    updateReportFieldAllOptionsDisabled: (count: number, enabled: boolean, option: string) => {\n                        if (toggledOptionsCount > 1) {\n                            return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} all options for \"${option}\".`;\n                        }\n                        return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} the option \"${option}\" for the report field \"${option}\", making all options ${enabled ? '[it] enabled' : '[it] disabled'}`;\n                    },\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it('Handles context annotations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    // @context As in a financial institution\n                    bank: 'Bank',\n                    // @context As in a financial institution\n                    bankTemplate: `Bank`,\n                    // @context As in an aviation maneuver\n                    aviationBank: 'Bank',\n                    // This key has regular comments mixed with context-comments\n                    // eslint-disable-next-line max-len\n                    // @context foo\n                    foo: 'Foo',\n                    // @context bar\n                    // What about if the context comment isn't the last comment?\n                    bar: 'Bar',\n                    some: {\n                        nested: {\n                            // @context nested\n                            str: 'nested string',\n                            // @context for my template function\n                            func: ({destructuredArg}) => `My template string contains a single ${destructuredArg} argument`,\n                        },\n                    },\n                    // @context will be applied to both translations\n                    boolFunc: (flag: boolean) => flag ? 'ValueIfTrue' : 'ValueIfFalse',\n                    separateContextTernaries: ((flag: boolean) => flag ? /* @context only for true */ 'True with context' : 'False without context'),\n                    // @context formal greeting, only provided to outermost template translation\n                    onlyInTopLevelOfTemplates: (name: string) =>\n                        `Salutations, ${name ?? /* @context inline context */ 'my very good friend'}`,\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    // @context As in a financial institution\n                    bank: '[it][ctx: As in a financial institution] Bank',\n                    // @context As in a financial institution\n                    bankTemplate: `[it][ctx: As in a financial institution] Bank`,\n                    // @context As in an aviation maneuver\n                    aviationBank: '[it][ctx: As in an aviation maneuver] Bank',\n                    // This key has regular comments mixed with context-comments\n                    // eslint-disable-next-line max-len\n                    // @context foo\n                    foo: '[it][ctx: foo] Foo',\n                    // @context bar\n                    // What about if the context comment isn't the last comment?\n                    bar: '[it][ctx: bar] Bar',\n                    some: {\n                        nested: {\n                            // @context nested\n                            str: '[it][ctx: nested] nested string',\n                            // @context for my template function\n                            func: ({destructuredArg}) => `[it][ctx: for my template function] My template string contains a single ${destructuredArg} argument`,\n                        },\n                    },\n                    // @context will be applied to both translations\n                    boolFunc: (flag: boolean) => (flag ? '[it][ctx: will be applied to both translations] ValueIfTrue' : '[it][ctx: will be applied to both translations] ValueIfFalse'),\n                    separateContextTernaries: (flag: boolean) => (flag ? /* @context only for true */ '[it][ctx: only for true] True with context' : '[it] False without context'),\n                    // @context formal greeting, only provided to outermost template translation\n                    onlyInTopLevelOfTemplates: (name: string) =>\n                        `[it][ctx: formal greeting, only provided to outermost template translation] Salutations, ${name ?? /* @context inline context */ '[it][ctx: inline context] my very good friend'}`,\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it("doesn't request duplicate translations", function () { return __awaiter(void 0, void 0, void 0, function () {
        var translateSpy, itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    greeting: 'Hello',\n                    farewell: 'Goodbye',\n                    repeatGreeting: `Hello`,\n                    nested: {\n                        anotherGreeting: 'Hello',\n                        anotherFarewell: 'Goodbye',\n                    },\n                    // @context diff\n                    greetingWithDifferentContext: 'Hello',\n                };\n                export default strings;\n            "), 'utf8');
                    translateSpy = jest.spyOn(Translator_1.default.prototype, 'translate');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    greeting: '[it] Hello',\n                    farewell: '[it] Goodbye',\n                    repeatGreeting: `[it] Hello`,\n                    nested: {\n                        anotherGreeting: '[it] Hello',\n                        anotherFarewell: '[it] Goodbye',\n                    },\n                    // @context diff\n                    greetingWithDifferentContext: '[it][ctx: diff] Hello',\n                };\n                export default strings;\n            ")));
                    expect(translateSpy).toHaveBeenCalledTimes(3);
                    expect(translateSpy).toHaveBeenNthCalledWith(1, 'it', 'Hello', undefined);
                    expect(translateSpy).toHaveBeenNthCalledWith(2, 'it', 'Goodbye', undefined);
                    expect(translateSpy).toHaveBeenNthCalledWith(3, 'it', 'Hello', 'diff');
                    return [2 /*return*/];
            }
        });
    }); });
    it("doesn't translate type annotations", function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    myFunc: ({brand}: {brand: 'Apple' | 'Google'}) => `${brand} Phone`,\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    myFunc: ({brand}: {brand: 'Apple' | 'Google'}) => `[it] ${brand} Phone`,\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
    it('unescapes unicode', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs_1.default.writeFileSync(EN_PATH, (0, dedent_1.default)("\n                const strings = {\n                    hello: '\u3053\u3093\u306B\u3061\u306F',\n                    world: 'world',\n                };\n                export default strings;\n            "), 'utf8');
                    return [4 /*yield*/, (0, generateTranslations_1.default)()];
                case 1:
                    _a.sent();
                    itContent = fs_1.default.readFileSync(IT_PATH, 'utf8');
                    expect(itContent).toStrictEqual("".concat(generateTranslations_1.GENERATED_FILE_PREFIX).concat((0, dedent_1.default)("\n                import type en from './en';\n\n                const strings = {\n                    hello: '[it] \u3053\u3093\u306B\u3061\u306F',\n                    world: '[it] world',\n                };\n                export default strings;\n            ")));
                    return [2 /*return*/];
            }
        });
    }); });
});
