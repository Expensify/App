#!/usr/bin/env npx ts-node
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENERATED_FILE_PREFIX = void 0;
/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
var dotenv = require("dotenv");
var fs_1 = require("fs");
var path_1 = require("path");
var typescript_1 = require("typescript");
var decodeUnicode_1 = require("@libs/StringUtils/decodeUnicode");
var dedent_1 = require("@libs/StringUtils/dedent");
var hash_1 = require("@libs/StringUtils/hash");
var LOCALES_1 = require("@src/CONST/LOCALES");
var CLI_1 = require("./utils/CLI");
var Prettier_1 = require("./utils/Prettier");
var PromisePool_1 = require("./utils/PromisePool");
var ChatGPTTranslator_1 = require("./utils/Translator/ChatGPTTranslator");
var DummyTranslator_1 = require("./utils/Translator/DummyTranslator");
var TSCompilerUtils_1 = require("./utils/TSCompilerUtils");
var GENERATED_FILE_PREFIX = (0, dedent_1.default)("\n    /**\n     *   _____                      __         __\n     *  / ___/__ ___  ___ _______ _/ /____ ___/ /\n     * / (_ / -_) _ \\/ -_) __/ _ \\`/ __/ -_) _  /\n     * \\___/\\__/_//_/\\__/_/  \\_,_/\\__/\\__/\\_,_/\n     *\n     * This file was automatically generated. Please consider these alternatives before manually editing it:\n     *\n     * - Improve the prompts in prompts/translation, or\n     * - Improve context annotations in src/languages/en.ts\n     */\n");
exports.GENERATED_FILE_PREFIX = GENERATED_FILE_PREFIX;
/**
 * This class encapsulates most of the non-CLI logic to generate translations.
 * The primary reason it exists as a class is so we can import this file with no side effects at the top level of the script.
 * This is useful for unit testing.
 *
 * At a high level, this is how it works:
 *  - It takes in a set of languages to generate translations for, a directory where translations are stored, and a file to use as the source of truth for translations.
 *  - It then uses the source file to recursively extract all string literals and template expressions, and uses ChatGPT to generate translations for each of them.
 *  - It then replaces the original string literals and template expressions with the translated ones, and writes the resulting code to a file.
 *  - It also formats the files using prettier.
 */
var TranslationGenerator = /** @class */ (function () {
    function TranslationGenerator(config) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        var sourceCode = fs_1.default.readFileSync(config.sourceFile, 'utf8');
        this.sourceFile = typescript_1.default.createSourceFile(config.sourceFile, sourceCode, typescript_1.default.ScriptTarget.Latest, true);
        this.translator = config.translator;
    }
    TranslationGenerator.prototype.generateTranslations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promisePool, _loop_1, this_1, _i, _a, targetLanguage;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        promisePool = new PromisePool_1.default();
                        _loop_1 = function (targetLanguage) {
                            var stringsToTranslate, translations, translationPromises, _loop_2, _d, stringsToTranslate_1, _e, key, _f, text, context, transformer, result, transformedSourceFile, printer, translatedCode, outputPath, finalFileContent;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        stringsToTranslate = new Map();
                                        this_1.extractStringsToTranslate(this_1.sourceFile, stringsToTranslate);
                                        translations = new Map();
                                        translationPromises = [];
                                        _loop_2 = function (key, text, context) {
                                            var translationPromise = promisePool.add(function () { return _this.translator.translate(targetLanguage, text, context).then(function (result) { return translations.set(key, result); }); });
                                            translationPromises.push(translationPromise);
                                        };
                                        for (_d = 0, stringsToTranslate_1 = stringsToTranslate; _d < stringsToTranslate_1.length; _d++) {
                                            _e = stringsToTranslate_1[_d], key = _e[0], _f = _e[1], text = _f.text, context = _f.context;
                                            _loop_2(key, text, context);
                                        }
                                        return [4 /*yield*/, Promise.allSettled(translationPromises)];
                                    case 1:
                                        _g.sent();
                                        transformer = this_1.createTransformer(translations);
                                        result = typescript_1.default.transform(this_1.sourceFile, [transformer]);
                                        transformedSourceFile = (_b = result.transformed.at(0)) !== null && _b !== void 0 ? _b : this_1.sourceFile;
                                        result.dispose();
                                        // Import en.ts
                                        transformedSourceFile = TSCompilerUtils_1.default.addImport(transformedSourceFile, 'en', './en', true);
                                        printer = typescript_1.default.createPrinter();
                                        translatedCode = (0, decodeUnicode_1.default)(printer.printFile(transformedSourceFile));
                                        outputPath = path_1.default.join(this_1.languagesDir, "".concat(targetLanguage, ".ts"));
                                        fs_1.default.writeFileSync(outputPath, translatedCode, 'utf8');
                                        // Format the file with prettier
                                        return [4 /*yield*/, Prettier_1.default.format(outputPath)];
                                    case 2:
                                        // Format the file with prettier
                                        _g.sent();
                                        finalFileContent = fs_1.default.readFileSync(outputPath, 'utf8');
                                        finalFileContent = finalFileContent.replace('export default translations satisfies TranslationDeepObject<typeof translations>;', 'export default translations satisfies TranslationDeepObject<typeof en>;');
                                        // Add a fun ascii art touch with a helpful message
                                        finalFileContent = "".concat(GENERATED_FILE_PREFIX).concat(finalFileContent);
                                        fs_1.default.writeFileSync(outputPath, finalFileContent, 'utf8');
                                        console.log("\u2705 Translated file created: ".concat(outputPath));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = this.targetLanguages;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        targetLanguage = _a[_i];
                        return [5 /*yield**/, _loop_1(targetLanguage)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Should the given node be translated?
     */
    TranslationGenerator.prototype.shouldNodeBeTranslated = function (node) {
        // We only translate string literals and template expressions
        if (!typescript_1.default.isStringLiteral(node) && !typescript_1.default.isTemplateExpression(node) && !typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
            return false;
        }
        // Don't translate any strings or expressions that affect code execution by being part of control flow.
        // We want to translate only strings that are "leaves" or "results" of any expression or code block
        var isPartOfControlFlow = node.parent &&
            // imports and exports
            (typescript_1.default.isImportDeclaration(node.parent) ||
                typescript_1.default.isExportDeclaration(node.parent) ||
                // Switch/case clause
                typescript_1.default.isCaseClause(node.parent) ||
                // any binary expression except coalescing operators and the operands of +=
                (typescript_1.default.isBinaryExpression(node.parent) &&
                    node.parent.operatorToken.kind !== typescript_1.default.SyntaxKind.QuestionQuestionToken &&
                    node.parent.operatorToken.kind !== typescript_1.default.SyntaxKind.BarBarToken &&
                    node.parent.operatorToken.kind !== typescript_1.default.SyntaxKind.PlusEqualsToken));
        if (isPartOfControlFlow) {
            return false;
        }
        // Don't translate any logs
        var isArgumentToLogFunction = node.parent &&
            typescript_1.default.isCallExpression(node.parent) &&
            typescript_1.default.isPropertyAccessExpression(node.parent.expression) &&
            ((typescript_1.default.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'console') ||
                (typescript_1.default.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'Log'));
        if (isArgumentToLogFunction) {
            return false;
        }
        // Don't translate a string that's a literal type annotation
        if (typescript_1.default.isLiteralTypeNode(node.parent)) {
            return false;
        }
        // Don't translate object keys
        if (typescript_1.default.isComputedPropertyName(node.parent)) {
            return false;
        }
        // Only translate string literals if they contain at least one real letter
        if (typescript_1.default.isStringLiteral(node) || typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
            // \p{L} matches a-z, à-ö, Α-Ω, Ж, 文, …  – but NOT digits, emoji, punctuation, etc.
            return /\p{L}/u.test(node.text);
        }
        // Only translate a template expression if it contains alphabet characters outside the spans
        var staticText = node.head.text;
        for (var _i = 0, _a = node.templateSpans; _i < _a.length; _i++) {
            var span = _a[_i];
            staticText += span.literal.text;
        }
        return /[a-zA-Z]/.test(staticText);
    };
    /**
     * Is a given expression (i.e: template placeholder) "simple"?
     * We define an expression as "simple" if it is an identifier or property access expression. Anything else is complex.
     *
     * @example ${name} => true
     * @example ${user.firstName} => true
     * @example ${CONST.REPORT.TYPES.EXPENSE} => true
     * @example ${name ?? 'someone'} => false
     * @example ${condition ? 'A' : 'B'} => false
     */
    TranslationGenerator.prototype.isSimpleExpression = function (expr) {
        return typescript_1.default.isIdentifier(expr) || typescript_1.default.isPropertyAccessExpression(expr) || typescript_1.default.isElementAccessExpression(expr);
    };
    /**
     * Is the given template expression "simple"? (i.e: can it be sent directly to ChatGPT to be translated)
     * We define a template expression as "simple" if each of its spans' expressions are simple (as defined by this.isSimpleTemplateSpan)
     *
     * @example `Hello, ${name}!` => true
     * @example `Welcome ${user.firstName}` => true
     * @example `Submit ${CONST.REPORT.TYPES.EXPENSE} report` => true
     * @example `Pay ${name ?? 'someone'}` => false
     * @example `Edit ${condition ? 'A' : 'B'}` => false
     */
    TranslationGenerator.prototype.isSimpleTemplateExpression = function (node) {
        var _this = this;
        return node.templateSpans.every(function (span) { return _this.isSimpleExpression(span.expression); });
    };
    /**
     * Extract any leading context annotation for a given node.
     */
    TranslationGenerator.prototype.getContextForNode = function (node) {
        var _a, _b;
        // First, check for an inline context comment.
        var inlineContext = (_a = node.getFullText().match(TranslationGenerator.CONTEXT_REGEX)) === null || _a === void 0 ? void 0 : _a[1].trim();
        if (inlineContext) {
            return inlineContext;
        }
        // Otherwise, look for the nearest ancestor that may have a comment attached.
        // For now, we only support property assignments.
        var nearestPropertyAssignmentAncestor = TSCompilerUtils_1.default.findAncestor(node, function (n) { return typescript_1.default.isPropertyAssignment(n); });
        if (!nearestPropertyAssignmentAncestor) {
            return undefined;
        }
        // Search through comments looking for a context comment
        var commentRanges = (_b = typescript_1.default.getLeadingCommentRanges(this.sourceFile.getFullText(), nearestPropertyAssignmentAncestor.getFullStart())) !== null && _b !== void 0 ? _b : [];
        for (var _i = 0, _c = commentRanges.reverse(); _i < _c.length; _i++) {
            var range = _c[_i];
            var commentText = this.sourceFile.getFullText().slice(range.pos, range.end);
            var match = commentText.match(TranslationGenerator.CONTEXT_REGEX);
            if (match) {
                return match[1].trim();
            }
        }
        // No context comments were found
        return undefined;
    };
    /**
     * Generate a hash of the string representation of a node along with any context comments.
     */
    TranslationGenerator.prototype.getTranslationKey = function (node) {
        if (!typescript_1.default.isStringLiteral(node) && !typescript_1.default.isNoSubstitutionTemplateLiteral(node) && !typescript_1.default.isTemplateExpression(node)) {
            throw new Error("Cannot generate translation key for node: ".concat(node.getText()));
        }
        // Trim leading whitespace, quotation marks, and backticks
        var keyBase = node
            .getText()
            .trim()
            .replace(/^['"`]/, '')
            .replace(/['"`]$/, '');
        var context = this.getContextForNode(node);
        if (context) {
            keyBase += context;
        }
        return (0, hash_1.default)(keyBase);
    };
    /**
     * Recursively extract all string literals and templates to translate from the subtree rooted at the given node.
     * Simple templates (as defined by this.isSimpleTemplateExpression) can be translated directly.
     * Complex templates must have each of their spans recursively translated first, so we'll extract all the lowest-level strings to translate.
     * Then complex templates will be serialized with a hash of complex spans in place of the span text, and we'll translate that.
     */
    TranslationGenerator.prototype.extractStringsToTranslate = function (node, stringsToTranslate) {
        var _this = this;
        if (this.shouldNodeBeTranslated(node)) {
            var context = this.getContextForNode(node);
            // String literals and no-substitution templates can be translated directly
            if (typescript_1.default.isStringLiteral(node) || typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
                stringsToTranslate.set(this.getTranslationKey(node), { text: node.text, context: context });
            }
            // Template expressions must be encoded directly before they can be translated
            else if (typescript_1.default.isTemplateExpression(node)) {
                if (this.isSimpleTemplateExpression(node)) {
                    stringsToTranslate.set(this.getTranslationKey(node), { text: this.templateExpressionToString(node), context: context });
                }
                else {
                    console.log('😵‍💫 Encountered complex template, recursively translating its spans first:', node.getText());
                    node.templateSpans.forEach(function (span) { return _this.extractStringsToTranslate(span, stringsToTranslate); });
                    stringsToTranslate.set(this.getTranslationKey(node), { text: this.templateExpressionToString(node), context: context });
                }
            }
        }
        node.forEachChild(function (child) { return _this.extractStringsToTranslate(child, stringsToTranslate); });
    };
    /**
     * Convert a template expression into a plain string representation that can be predictably serialized.
     * All ${...} spans containing complex expressions are replaced in the string by hashes of the expression text.
     *
     * @example templateExpressionToString(`Edit ${action?.type === 'IOU' ? 'expense' : 'comment'} on ${date}`)
     *       => `Edit ${HASH1} on ${date}`
     */
    TranslationGenerator.prototype.templateExpressionToString = function (expression) {
        var result = expression.head.text;
        for (var _i = 0, _a = expression.templateSpans; _i < _a.length; _i++) {
            var span = _a[_i];
            if (this.isSimpleExpression(span.expression)) {
                result += "${".concat(span.expression.getText(), "}");
            }
            else {
                result += "${".concat((0, hash_1.default)(span.expression.getText()), "}");
            }
            result += span.literal.text;
        }
        return result;
    };
    /**
     * Convert our string-encoded template expression to a template expression.
     * If the template contains any complex spans, those must be translated first, and those translations need to be passed in.
     */
    TranslationGenerator.prototype.stringToTemplateExpression = function (input, translatedComplexExpressions) {
        var _a, _b, _c;
        if (translatedComplexExpressions === void 0) { translatedComplexExpressions = new Map(); }
        var regex = /\$\{([^}]*)}/g;
        var matches = __spreadArray([], input.matchAll(regex), true);
        var headText = input.slice(0, (_b = (_a = matches.at(0)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : input.length);
        var templateHead = typescript_1.default.factory.createTemplateHead(headText);
        var spans = [];
        for (var i = 0; i < matches.length; i++) {
            var match = matches.at(i);
            if (!match) {
                continue;
            }
            var fullMatch = match[0], placeholder = match[1];
            var expression = void 0;
            var trimmed = placeholder.trim();
            if (/^\d+$/.test(trimmed)) {
                // It's a hash reference to a complex span
                var hashed = Number(trimmed);
                var translatedExpression = translatedComplexExpressions.get(hashed);
                if (!translatedExpression) {
                    throw new Error("No template found for hash: ".concat(hashed));
                }
                expression = translatedExpression;
            }
            else {
                // Assume it's a simple identifier or property access
                expression = typescript_1.default.factory.createIdentifier(trimmed);
            }
            var startOfMatch = match.index;
            var nextStaticTextStart = startOfMatch + fullMatch.length;
            var nextStaticTextEnd = i + 1 < matches.length ? (_c = matches.at(i + 1)) === null || _c === void 0 ? void 0 : _c.index : input.length;
            var staticText = input.slice(nextStaticTextStart, nextStaticTextEnd);
            var literal = i === matches.length - 1 ? typescript_1.default.factory.createTemplateTail(staticText) : typescript_1.default.factory.createTemplateMiddle(staticText);
            spans.push(typescript_1.default.factory.createTemplateSpan(expression, literal));
        }
        return typescript_1.default.factory.createTemplateExpression(templateHead, spans);
    };
    /**
     * Generate an AST transformer for the given set of translations.
     */
    TranslationGenerator.prototype.createTransformer = function (translations) {
        var _this = this;
        return function (context) {
            var visit = function (node) {
                if (_this.shouldNodeBeTranslated(node)) {
                    if (typescript_1.default.isStringLiteral(node)) {
                        var translatedText = translations.get(_this.getTranslationKey(node));
                        return translatedText ? typescript_1.default.factory.createStringLiteral(translatedText) : node;
                    }
                    if (typescript_1.default.isNoSubstitutionTemplateLiteral(node)) {
                        var translatedText = translations.get(_this.getTranslationKey(node));
                        return translatedText ? typescript_1.default.factory.createNoSubstitutionTemplateLiteral(translatedText) : node;
                    }
                    if (typescript_1.default.isTemplateExpression(node)) {
                        var translatedTemplate = translations.get(_this.getTranslationKey(node));
                        if (!translatedTemplate) {
                            console.warn('⚠️ No translation found for template expression', node.getText());
                            return node;
                        }
                        // Recursively translate all complex template expressions first
                        var translatedComplexExpressions = new Map();
                        // Template expression is complex:
                        for (var _i = 0, _a = node.templateSpans; _i < _a.length; _i++) {
                            var span = _a[_i];
                            var expression = span.expression;
                            if (_this.isSimpleExpression(expression)) {
                                continue;
                            }
                            var hash = (0, hash_1.default)(expression.getText());
                            var translatedExpression = typescript_1.default.visitNode(expression, visit);
                            translatedComplexExpressions.set(hash, translatedExpression);
                        }
                        // Build the translated template expression, referencing the translated template spans as necessary
                        return _this.stringToTemplateExpression(translatedTemplate, translatedComplexExpressions);
                    }
                }
                return typescript_1.default.visitEachChild(node, visit, context);
            };
            return function (node) {
                var _a;
                var transformedNode = (_a = typescript_1.default.visitNode(node, visit)) !== null && _a !== void 0 ? _a : node; // Ensure we always return a valid node
                return transformedNode; // Safe cast since we always pass in a SourceFile
            };
        };
    };
    TranslationGenerator.CONTEXT_REGEX = /^\s*(?:\/{2}|\*|\/\*)?\s*@context\s+([^\n*/]+)/;
    return TranslationGenerator;
}());
/**
 * The main function mostly contains CLI and file I/O logic, while TS parsing and translation logic is encapsulated in TranslationGenerator.
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var cli, translator, languagesDir, enSourceFile, generator;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cli = new CLI_1.default({
                        flags: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'dry-run': {
                                description: 'If true, just do local mocked translations rather than making real requests to an AI translator.',
                            },
                        },
                        namedArgs: {
                            // By default, generate translations for all supported languages. Can be overridden with the --locales flag
                            locales: {
                                description: 'Locales to generate translations for.',
                                default: Object.values(LOCALES_1.TRANSLATION_TARGET_LOCALES).filter(function (locale) { return locale !== LOCALES_1.LOCALES.ES; }),
                                parse: function (val) {
                                    var rawLocales = val.split(',');
                                    var validatedLocales = [];
                                    for (var _i = 0, rawLocales_1 = rawLocales; _i < rawLocales_1.length; _i++) {
                                        var locale = rawLocales_1[_i];
                                        if (!(0, LOCALES_1.isTranslationTargetLocale)(locale)) {
                                            throw new Error("Invalid locale ".concat(String(locale)));
                                        }
                                        validatedLocales.push(locale);
                                    }
                                    return validatedLocales;
                                },
                            },
                        },
                    });
                    if (cli.flags['dry-run']) {
                        console.log('🍸 Dry run enabled');
                        translator = new DummyTranslator_1.default();
                    }
                    else {
                        // Ensure OPEN_AI_KEY is set in environment
                        if (!process.env.OPENAI_API_KEY) {
                            // If not, try to load it from .env
                            dotenv.config({ path: path_1.default.resolve(__dirname, '../.env') });
                            if (!process.env.OPENAI_API_KEY) {
                                throw new Error('❌ OPENAI_API_KEY not found in environment.');
                            }
                        }
                        translator = new ChatGPTTranslator_1.default(process.env.OPENAI_API_KEY);
                    }
                    languagesDir = (_a = process.env.LANGUAGES_DIR) !== null && _a !== void 0 ? _a : path_1.default.join(__dirname, '../src/languages');
                    enSourceFile = path_1.default.join(languagesDir, 'en.ts');
                    generator = new TranslationGenerator({
                        targetLanguages: cli.namedArgs.locales,
                        languagesDir: languagesDir,
                        sourceFile: enSourceFile,
                        translator: translator,
                    });
                    return [4 /*yield*/, generator.generateTranslations()];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main();
}
exports.default = main;
