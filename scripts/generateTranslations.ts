#!/usr/bin/env npx ts-node

/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import type {TemplateExpression} from 'typescript';
import ts from 'typescript';
import dedent from '@libs/StringUtils/dedent';
import hashStr from '@libs/StringUtils/hash';
import {LANGUAGES, UPCOMING_LANGUAGES} from '@src/CONST/LOCALES';
import type {TranslationTargetLanguage} from '@src/CONST/LOCALES';
import CLI from './utils/CLI';
import Prettier from './utils/Prettier';
import PromisePool from './utils/PromisePool';
import ChatGPTTranslator from './utils/Translator/ChatGPTTranslator';
import DummyTranslator from './utils/Translator/DummyTranslator';
import type Translator from './utils/Translator/Translator';
import TSCompilerUtils from './utils/TSCompilerUtils';

const GENERATED_FILE_PREFIX = dedent(`
    /**
     *   _____                      __         __
     *  / ___/__ ___  ___ _______ _/ /____ ___/ /
     * / (_ / -_) _ \\/ -_) __/ _ \\\`/ __/ -_) _  /
     * \\___/\\__/_//_/\\__/_/  \\_,_/\\__/\\__/\\_,_/
     *
     * This file was automatically generated. Please consider these alternatives before manually editing it:
     *
     * - Improve the prompts in prompts/translation, or
     * - Improve context annotations in src/languages/en.ts
     */
`);

/**
 * This represents a string to translate. In the context of translation, two strings are considered equal only if their contexts are also equal.
 */
type StringWithContext = {
    text: string;
    context?: string;
};

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
class TranslationGenerator {
    private static readonly CONTEXT_REGEX = /^\s*(?:\/{2}|\*|\/\*)?\s*@context\s+([^\n*/]+)/;

    /**
     * The languages to generate translations for.
     */
    private readonly targetLanguages: TranslationTargetLanguage[];

    /**
     * The directory where translations are stored.
     */
    private readonly languagesDir: string;

    /**
     * The file to use as the source of truth for translations.
     */
    private readonly sourceFile: ts.SourceFile;

    /**
     * Translator module to perform translations.
     */
    private readonly translator: Translator;

    constructor(config: {targetLanguages: TranslationTargetLanguage[]; languagesDir: string; sourceFile: string; translator: Translator}) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        const sourceCode = fs.readFileSync(config.sourceFile, 'utf8');
        this.sourceFile = ts.createSourceFile(config.sourceFile, sourceCode, ts.ScriptTarget.Latest, true);
        this.translator = config.translator;
    }

    public async generateTranslations(): Promise<void> {
        const promisePool = new PromisePool();

        for (const targetLanguage of this.targetLanguages) {
            // Extract strings to translate
            const stringsToTranslate = new Map<number, StringWithContext>();
            this.extractStringsToTranslate(this.sourceFile, stringsToTranslate);

            // Translate all the strings in parallel (up to 8 at a time)
            const translations = new Map<number, string>();
            const translationPromises = [];
            for (const [key, {text, context}] of stringsToTranslate) {
                const translationPromise = promisePool.add(() => this.translator.translate(targetLanguage, text, context).then((result) => translations.set(key, result)));
                translationPromises.push(translationPromise);
            }
            await Promise.allSettled(translationPromises);

            // Replace translated strings in the AST
            const transformer = this.createTransformer(translations);
            const result = ts.transform(this.sourceFile, [transformer]);
            let transformedSourceFile = result.transformed.at(0) ?? this.sourceFile; // Ensure we always have a valid SourceFile
            result.dispose();

            // Import en.ts
            transformedSourceFile = TSCompilerUtils.addImport(transformedSourceFile, 'en', './en', true);

            // Generate translated TypeScript code
            const printer = ts.createPrinter();
            const translatedCode = printer.printFile(transformedSourceFile);

            // Write to file
            const outputPath = path.join(this.languagesDir, `${targetLanguage}.ts`);
            fs.writeFileSync(outputPath, translatedCode, 'utf8');

            // Format the file with prettier
            await Prettier.format(outputPath);

            // Enforce that the type of translated files matches en.ts
            let finalFileContent = fs.readFileSync(outputPath, 'utf8');
            finalFileContent = finalFileContent.replace(
                'export default translations satisfies TranslationDeepObject<typeof translations>;',
                'export default translations satisfies TranslationDeepObject<typeof en>;',
            );

            // Add a fun ascii art touch with a helpful message
            finalFileContent = `${GENERATED_FILE_PREFIX}${finalFileContent}`;

            fs.writeFileSync(outputPath, finalFileContent, 'utf8');

            console.log(`✅ Translated file created: ${outputPath}`);
        }
    }

    /**
     * Should the given node be translated?
     */
    private shouldNodeBeTranslated(node: ts.Node): boolean {
        // We only translate string literals and template expressions
        if (!ts.isStringLiteral(node) && !ts.isTemplateExpression(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
            return false;
        }

        // Don't translate any strings or expressions that affect code execution by being part of control flow.
        // We want to translate only strings that are "leaves" or "results" of any expression or code block
        const isPartOfControlFlow =
            node.parent &&
            // imports and exports
            (ts.isImportDeclaration(node.parent) ||
                ts.isExportDeclaration(node.parent) ||
                // Switch/case clause
                ts.isCaseClause(node.parent) ||
                // any binary expression except coalescing operators and the operands of +=
                (ts.isBinaryExpression(node.parent) &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.BarBarToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken));

        if (isPartOfControlFlow) {
            return false;
        }

        // Don't translate any logs
        const isArgumentToLogFunction =
            node.parent &&
            ts.isCallExpression(node.parent) &&
            ts.isPropertyAccessExpression(node.parent.expression) &&
            ((ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'console') ||
                (ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'Log'));

        if (isArgumentToLogFunction) {
            return false;
        }

        // Don't translate a string that's a literal type annotation
        if (ts.isLiteralTypeNode(node.parent)) {
            return false;
        }

        // Only translate string literals if they contain alphabet characters
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            return /[a-zA-Z]/.test(node.text);
        }

        // Only translate a template expression if it contains alphabet characters outside the spans
        let staticText = node.head.text;
        for (const span of node.templateSpans) {
            staticText += span.literal.text;
        }
        return /[a-zA-Z]/.test(staticText);
    }

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
    private isSimpleExpression(expr: ts.Expression): boolean {
        return ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr) || ts.isElementAccessExpression(expr);
    }

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
    private isSimpleTemplateExpression(node: ts.TemplateExpression): boolean {
        return node.templateSpans.every((span) => this.isSimpleExpression(span.expression));
    }

    /**
     * Extract any leading context annotation for a given node.
     */
    private getContextForNode(node: ts.Node): string | undefined {
        // First, check for an inline context comment.
        const inlineContext = node.getFullText().match(TranslationGenerator.CONTEXT_REGEX)?.[1].trim();
        if (inlineContext) {
            return inlineContext;
        }

        // Otherwise, look for the nearest ancestor that may have a comment attached.
        // For now, we only support property assignments.
        const nearestPropertyAssignmentAncestor = TSCompilerUtils.findAncestor(node, (n): n is ts.PropertyAssignment => ts.isPropertyAssignment(n));
        if (!nearestPropertyAssignmentAncestor) {
            return undefined;
        }

        // Search through comments looking for a context comment
        const commentRanges = ts.getLeadingCommentRanges(this.sourceFile.getFullText(), nearestPropertyAssignmentAncestor.getFullStart()) ?? [];
        for (const range of commentRanges.reverse()) {
            const commentText = this.sourceFile.getFullText().slice(range.pos, range.end);
            const match = commentText.match(TranslationGenerator.CONTEXT_REGEX);
            if (match) {
                return match[1].trim();
            }
        }

        // No context comments were found
        return undefined;
    }

    /**
     * Generate a hash of the string representation of a node along with any context comments.
     */
    private getTranslationKey(node: ts.Node): number {
        if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node) && !ts.isTemplateExpression(node)) {
            throw new Error(`Cannot generate translation key for node: ${node.getText()}`);
        }

        // Trim leading whitespace, quotation marks, and backticks
        let keyBase = node
            .getText()
            .trim()
            .replace(/^['"`]/, '')
            .replace(/['"`]$/, '');

        const context = this.getContextForNode(node);
        if (context) {
            keyBase += context;
        }

        return hashStr(keyBase);
    }

    /**
     * Recursively extract all string literals and templates to translate from the subtree rooted at the given node.
     * Simple templates (as defined by this.isSimpleTemplateExpression) can be translated directly.
     * Complex templates must have each of their spans recursively translated first, so we'll extract all the lowest-level strings to translate.
     * Then complex templates will be serialized with a hash of complex spans in place of the span text, and we'll translate that.
     */
    private extractStringsToTranslate(node: ts.Node, stringsToTranslate: Map<number, StringWithContext>) {
        if (this.shouldNodeBeTranslated(node)) {
            const context = this.getContextForNode(node);

            // String literals and no-substitution templates can be translated directly
            if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
                stringsToTranslate.set(this.getTranslationKey(node), {text: node.text, context});
            }

            // Template expressions must be encoded directly before they can be translated
            else if (ts.isTemplateExpression(node)) {
                if (this.isSimpleTemplateExpression(node)) {
                    stringsToTranslate.set(this.getTranslationKey(node), {text: this.templateExpressionToString(node), context});
                } else {
                    console.log('😵‍💫 Encountered complex template, recursively translating its spans first:', node.getText());
                    node.templateSpans.forEach((span) => this.extractStringsToTranslate(span, stringsToTranslate));
                    stringsToTranslate.set(this.getTranslationKey(node), {text: this.templateExpressionToString(node), context});
                }
            }
        }
        node.forEachChild((child) => this.extractStringsToTranslate(child, stringsToTranslate));
    }

    /**
     * Convert a template expression into a plain string representation that can be predictably serialized.
     * All ${...} spans containing complex expressions are replaced in the string by hashes of the expression text.
     *
     * @example templateExpressionToString(`Edit ${action?.type === 'IOU' ? 'expense' : 'comment'} on ${date}`)
     *       => `Edit ${HASH1} on ${date}`
     */
    private templateExpressionToString(expression: TemplateExpression): string {
        let result = expression.head.text;
        for (const span of expression.templateSpans) {
            if (this.isSimpleExpression(span.expression)) {
                result += `\${${span.expression.getText()}}`;
            } else {
                result += `\${${hashStr(span.expression.getText())}}`;
            }
            result += span.literal.text;
        }
        return result;
    }

    /**
     * Convert our string-encoded template expression to a template expression.
     * If the template contains any complex spans, those must be translated first, and those translations need to be passed in.
     */
    private stringToTemplateExpression(input: string, translatedComplexExpressions = new Map<number, ts.Expression>()): ts.TemplateExpression {
        const regex = /\$\{([^}]*)}/g;
        const matches = [...input.matchAll(regex)];

        const headText = input.slice(0, matches.at(0)?.index ?? input.length);
        const templateHead = ts.factory.createTemplateHead(headText);

        const spans: ts.TemplateSpan[] = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches.at(i);
            if (!match) {
                continue;
            }
            const [fullMatch, placeholder] = match;

            let expression: ts.Expression;
            const trimmed = placeholder.trim();
            if (/^\d+$/.test(trimmed)) {
                // It's a hash reference to a complex span
                const hashed = Number(trimmed);
                const translatedExpression = translatedComplexExpressions.get(hashed);
                if (!translatedExpression) {
                    throw new Error(`No template found for hash: ${hashed}`);
                }
                expression = translatedExpression;
            } else {
                // Assume it's a simple identifier or property access
                expression = ts.factory.createIdentifier(trimmed);
            }

            const startOfMatch = match.index;
            const nextStaticTextStart = startOfMatch + fullMatch.length;
            const nextStaticTextEnd = i + 1 < matches.length ? matches.at(i + 1)?.index : input.length;
            const staticText = input.slice(nextStaticTextStart, nextStaticTextEnd);

            const literal = i === matches.length - 1 ? ts.factory.createTemplateTail(staticText) : ts.factory.createTemplateMiddle(staticText);

            spans.push(ts.factory.createTemplateSpan(expression, literal));
        }

        return ts.factory.createTemplateExpression(templateHead, spans);
    }

    /**
     * Generate an AST transformer for the given set of translations.
     */
    private createTransformer(translations: Map<number, string>): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            const visit: ts.Visitor = (node) => {
                if (this.shouldNodeBeTranslated(node)) {
                    if (ts.isStringLiteral(node)) {
                        const translatedText = translations.get(this.getTranslationKey(node));
                        return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
                    }

                    if (ts.isNoSubstitutionTemplateLiteral(node)) {
                        const translatedText = translations.get(this.getTranslationKey(node));
                        return translatedText ? ts.factory.createNoSubstitutionTemplateLiteral(translatedText) : node;
                    }

                    if (ts.isTemplateExpression(node)) {
                        const translatedTemplate = translations.get(this.getTranslationKey(node));
                        if (!translatedTemplate) {
                            console.warn('⚠️ No translation found for template expression', node.getText());
                            return node;
                        }

                        // Recursively translate all complex template expressions first
                        const translatedComplexExpressions = new Map<number, ts.Expression>();

                        // Template expression is complex:
                        for (const span of node.templateSpans) {
                            const expression = span.expression;
                            if (this.isSimpleExpression(expression)) {
                                continue;
                            }
                            const hash = hashStr(expression.getText());
                            const translatedExpression = ts.visitNode(expression, visit);
                            translatedComplexExpressions.set(hash, translatedExpression as ts.Expression);
                        }

                        // Build the translated template expression, referencing the translated template spans as necessary
                        return this.stringToTemplateExpression(translatedTemplate, translatedComplexExpressions);
                    }
                }
                return ts.visitEachChild(node, visit, context);
            };

            return (node: ts.SourceFile) => {
                const transformedNode = ts.visitNode(node, visit) ?? node; // Ensure we always return a valid node
                return transformedNode as ts.SourceFile; // Safe cast since we always pass in a SourceFile
            };
        };
    }
}

function isTranslationTargetLanguage(str: string): str is TranslationTargetLanguage {
    return (LANGUAGES as readonly string[]).includes(str) || (UPCOMING_LANGUAGES as readonly string[]).includes(str);
}

/**
 * The main function mostly contains CLI and file I/O logic, while TS parsing and translation logic is encapsulated in TranslationGenerator.
 */
async function main(): Promise<void> {
    const cli = new CLI({
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
                default: UPCOMING_LANGUAGES as unknown as TranslationTargetLanguage[],
                parse: (val: string): TranslationTargetLanguage[] => {
                    const rawLocales = val.split(',');
                    const validatedLocales: TranslationTargetLanguage[] = [];
                    for (const locale of rawLocales) {
                        if (!isTranslationTargetLanguage(locale)) {
                            throw new Error(`Invalid locale ${String(locale)}`);
                        }
                        validatedLocales.push(locale);
                    }
                    return validatedLocales;
                },
            },
        },
    } as const);

    let translator: Translator;
    if (cli.flags['dry-run']) {
        console.log('🍸 Dry run enabled');
        translator = new DummyTranslator();
    } else {
        // Ensure OPEN_AI_KEY is set in environment
        if (!process.env.OPENAI_API_KEY) {
            // If not, try to load it from .env
            dotenv.config({path: path.resolve(__dirname, '../.env')});
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('❌ OPENAI_API_KEY not found in environment.');
            }
        }
        translator = new ChatGPTTranslator(process.env.OPENAI_API_KEY);
    }

    const languagesDir = process.env.LANGUAGES_DIR || path.join(__dirname, '../src/languages');
    const enSourceFile = path.join(languagesDir, 'en.ts');

    const generator = new TranslationGenerator({
        targetLanguages: cli.namedArgs.locales,
        languagesDir,
        sourceFile: enSourceFile,
        translator,
    });
    await generator.generateTranslations();
}

if (require.main === module) {
    main();
}

export default main;
export {GENERATED_FILE_PREFIX};
