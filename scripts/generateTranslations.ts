/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import type {TemplateExpression} from 'typescript';
import ts from 'typescript';
import StringUtils from '../src/libs/StringUtils';
import type Locale from '../src/types/onyx/Locale';
import Prettier from './utils/Prettier';
import PromisePool from './utils/PromisePool';
import ChatGPTTranslator from './utils/Translator/ChatGPTTranslator';
import DummyTranslator from './utils/Translator/DummyTranslator';
import type Translator from './utils/Translator/Translator';

/**
 * This class encapsulates most of the non-CLI logic to generate translations.
 * The primary reason it exists as a class is so we can import this file with no side-effects at the top level of the script.
 * This is useful for unit testing.
 *
 * At a high level, this is how it works:
 *  - It takes in a set of languages to generate translations for, a directory where translations are stored, and a file to use as the source of truth for translations.
 *  - It then uses the source file to recursively extract all string literals and template expressions, and uses ChatGPT to generate translations for each of them.
 *  - It then replaces the original string literals and template expressions with the translated ones, and writes the resulting code to a file.
 *  - It also formats the files using prettier.
 */
class TranslationGenerator {
    /**
     * The languages to generate translations for.
     */
    private readonly targetLanguages: Locale[];

    /**
     * The directory where translations are stored.
     */
    private readonly languagesDir: string;

    /**
     * The file to use as the source of truth for translations.
     */
    private readonly sourceFile: string;

    /**
     * Translator module to perform translations.
     */
    private readonly translator: Translator;

    constructor(config: {targetLanguages: Locale[]; languagesDir: string; sourceFile: string; translator: Translator}) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        this.sourceFile = config.sourceFile;
        this.translator = config.translator;
    }

    public async generateTranslations(): Promise<void> {
        const sourceCode = fs.readFileSync(this.sourceFile, 'utf8');
        const sourceFile = ts.createSourceFile(this.sourceFile, sourceCode, ts.ScriptTarget.Latest, true);
        const promisePool = new PromisePool();

        for (const targetLanguage of this.targetLanguages) {
            // Extract strings to translate
            const stringsToTranslate = new Map<number, string>();
            this.extractStringsToTranslate(sourceFile, stringsToTranslate);

            const translations = new Map<number, string>();
            const translationPromises = [];
            for (const [key, value] of stringsToTranslate) {
                const translationPromise = promisePool.add(() => this.translator.translate(value, targetLanguage).then((result) => translations.set(key, result)));
                translationPromises.push(translationPromise);
            }
            await Promise.allSettled(translationPromises);

            // Replace translated strings in the AST
            const transformer = this.createTransformer(translations);
            const result = ts.transform(sourceFile, [transformer]);
            const transformedNode = result.transformed.at(0) ?? sourceFile; // Ensure we always have a valid SourceFile
            result.dispose();

            // Generate translated TypeScript code
            const printer = ts.createPrinter();
            const translatedCode = printer.printFile(transformedNode);

            // Write to file
            const outputPath = path.join(this.languagesDir, `${targetLanguage}.ts`);
            fs.writeFileSync(outputPath, translatedCode, 'utf8');

            // Format the file with prettier
            await Prettier.format(outputPath);

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
     * Is a given template span (aka placeholder) "simple"?
     * We define a span as "simple" if it is and identifier or property access expression. Anything else is complex.
     *
     * @example ${name} => true
     * @example ${user.firstName} => true
     * @example ${CONST.REPORT.TYPES.EXPENSE} => true
     * @example ${name ?? 'someone'} => false
     * @example ${condition ? 'A' : 'B'} => false
     */
    private isSimpleTemplateSpan(span: ts.TemplateSpan): boolean {
        return ts.isIdentifier(span.expression) || ts.isPropertyAccessExpression(span.expression) || ts.isElementAccessExpression(span.expression);
    }

    /**
     * Is the given template expression "simple"? (i.e: can it be sent directly to ChatGPT to be translated)
     * We define a template expression as "simple" each of its spans are simple (as defined by this.isSimpleTemplateSpan)
     *
     * @example `Hello, ${name}!` => true
     * @example `Welcome ${user.firstName}` => true
     * @example `Submit ${CONST.REPORT.TYPES.EXPENSE} report` => true
     * @example `Pay ${name ?? 'someone'}` => false
     * @example `Edit ${condition ? 'A' : 'B'}` => false
     */
    private isSimpleTemplateExpression(node: ts.TemplateExpression): boolean {
        return node.templateSpans.every((span) => this.isSimpleTemplateSpan(span));
    }

    /**
     * Recursively extract all string literals and templates to translate from the subtree rooted at the given node.
     * Simple templates (as defined by this.isSimpleTemplateExpression) can be translated directly.
     * Complex templates must have each of their spans recursively translated first, so we'll extract all the lowest-level strings to translate,
     * and then complex templates will be serialized with a hash of complex spans in place of the span text, and we'll translate that.
     */
    private extractStringsToTranslate(node: ts.Node, stringsToTranslate: Map<number, string>) {
        if (this.shouldNodeBeTranslated(node)) {
            if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
                stringsToTranslate.set(StringUtils.hash(node.text), node.text);
            } else if (ts.isTemplateExpression(node)) {
                if (this.isSimpleTemplateExpression(node)) {
                    stringsToTranslate.set(StringUtils.hash(node.getText()), this.templateExpressionToString(node));
                } else {
                    console.log('😵‍💫 Encountered complex template, recursively translating its spans first:', node.getText());
                    node.templateSpans.forEach((span) => this.extractStringsToTranslate(span, stringsToTranslate));
                    stringsToTranslate.set(StringUtils.hash(node.getText()), this.templateExpressionToString(node));
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
            const expressionText = span.expression.getText();
            if (this.isSimpleTemplateSpan(span)) {
                result += `\${${expressionText}}`;
            } else {
                result += `\${${StringUtils.hash(expressionText)}}`;
            }
            result += span.literal.text;
        }
        return result;
    }

    /**
     * Convert our string-encoded template expression to a template expression.
     * If the template contains any complex spans, those must be translated first, and those translations need to be passed in.
     */
    private stringToTemplateExpression(input: string, translatedComplexSpans = new Map<number, ts.TemplateSpan>()): ts.TemplateExpression {
        const regex = /\$\{([^}]*)}/g;
        const spans: ts.TemplateSpan[] = [];

        const matchIterator = input.matchAll(regex);

        const firstMatch = matchIterator.next();
        const headText = firstMatch.done ? input : input.slice(0, firstMatch.value.index);
        const templateHead = ts.factory.createTemplateHead(headText);

        const matches = [...input.matchAll(regex)];

        for (let i = 0; i < matches.length; i++) {
            // eslint-disable-next-line rulesdir/prefer-at
            const match = matches[i];
            const [fullMatch, placeholder] = match;
            const trimmed = placeholder.trim();
            let expr: ts.Expression;

            if (/^\d+$/.test(trimmed)) {
                // It's a hash reference to a complex span
                const hashed = Number(trimmed);
                const translatedSpan = translatedComplexSpans.get(hashed);
                if (!translatedSpan) {
                    throw new Error(`No template found for hash: ${hashed}`);
                }
                spans.push(translatedSpan);
                continue;
            } else {
                // Assume it's a simple identifier or property access
                expr = ts.factory.createIdentifier(trimmed);
            }

            const startOfMatch = match.index;
            const nextStaticTextStart = startOfMatch + fullMatch.length;
            const nextStaticTextEnd = i + 1 < matches.length ? matches.at(i + 1)?.index : input.length;
            const staticText = input.slice(nextStaticTextStart, nextStaticTextEnd);

            const literal = i === matches.length - 1 ? ts.factory.createTemplateTail(staticText) : ts.factory.createTemplateMiddle(staticText);

            spans.push(ts.factory.createTemplateSpan(expr, literal));
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
                        const translatedText = translations.get(StringUtils.hash(node.text));
                        return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
                    }

                    if (ts.isNoSubstitutionTemplateLiteral(node)) {
                        const translatedText = translations.get(StringUtils.hash(node.text));
                        return translatedText ? ts.factory.createNoSubstitutionTemplateLiteral(translatedText) : node;
                    }

                    if (ts.isTemplateExpression(node)) {
                        const translatedTemplate = translations.get(StringUtils.hash(node.getText()));
                        if (!translatedTemplate) {
                            console.warn('⚠️ No translation found for template expression', node.getText());
                            return node;
                        }

                        // Recursively translate all complex template spans first
                        const translatedComplexSpans = new Map<number, ts.TemplateSpan>();

                        // Template expression is complex:
                        for (const span of node.templateSpans) {
                            if (this.isSimpleTemplateSpan(span)) {
                                continue;
                            }
                            const hash = StringUtils.hash(span.expression.getText());
                            const translatedSpan = ts.visitNode(span, visit);
                            translatedComplexSpans.set(hash, translatedSpan as ts.TemplateSpan);
                        }

                        // Build the translated template expression, referencing the translated template spans as necessary
                        return this.stringToTemplateExpression(translatedTemplate, translatedComplexSpans);
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

/**
 * The main function mostly contains CLI and file I/O logic, while TS parsing and translation logic is encapsulated in TranslationGenerator.
 */
async function main(): Promise<void> {
    let translator: Translator;
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
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
        targetLanguages: ['it' as Locale],
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
