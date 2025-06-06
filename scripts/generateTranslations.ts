/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import type {TemplateExpression} from 'typescript';
import ts from 'typescript';
import StringUtils from '../src/libs/StringUtils';
import type Locale from '../src/types/onyx/Locale';
import Prettier from './utils/Prettier';

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
     * OpenAI API client to perform translations. If undefined, it's assumed that this is a dry run for testing.
     */
    private readonly openai: OpenAI | undefined;

    constructor(config: {targetLanguages: Locale[]; languagesDir: string; sourceFile: string; openai?: OpenAI}) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        this.sourceFile = config.sourceFile;
        this.openai = config.openai;
    }

    public async generateTranslations(): Promise<void> {
        const sourceCode = fs.readFileSync(this.sourceFile, 'utf8');
        const sourceFile = ts.createSourceFile(this.sourceFile, sourceCode, ts.ScriptTarget.Latest, true);

        for (const targetLanguage of this.targetLanguages) {
            // Extract strings to translate
            const stringsToTranslate = new Map<number, string>();
            this.extractStringsToTranslate(sourceFile, stringsToTranslate);

            const translations = new Map<number, string>();
            for (const [key, value] of stringsToTranslate) {
                translations.set(key, await this.translate(value, targetLanguage));
            }

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
     * Translate a single string to a target language.
     */
    private async translate(text: string, targetLang: string): Promise<string> {
        if (!text || text.trim().length === 0) {
            return text;
        }
        try {
            let result: string;
            if (this.openai) {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following text to ${targetLang}. It is either a plain string or a TypeScript template string. Preserve placeholders like \${username}, \${count}, \${123456} etc without modifying their contents or removing the brackets. In most cases, the contents of the placeholders are descriptive of what they represent in the phrase, but in some cases the placeholders may just contain a number. If it can't be translated, reply with the same text unchanged.`,
                        },
                        {role: 'user', content: text},
                    ],
                    temperature: 0.3,
                });
                result = response.choices.at(0)?.message?.content?.trim() ?? text;
            } else {
                result = `[${targetLang}] ${text}`;
            }
            console.log(`🧠 Translated "${text}" to ${targetLang}: "${result}"`);
            return result;
        } catch (error) {
            console.error(`Error translating "${text}" to ${targetLang}:`, error);
            return text; // Fallback to English if translation fails
        }
    }

    /**
     * A node should be translated only if:
     *
     * - It is not an import or export path.
     * - It is not part of a control statement such as an if/else, binary expression (the conditional part of a ternary), or a switch/case.
     * - It is not part of a log call
     * - It is "dangling" (doesn't have a parent). This is an edge case we're unlikely to encounter in real code.
     */
    private shouldNodeBeTranslated(node: ts.Node): boolean {
        return (
            !node.parent ||
            (!ts.isImportDeclaration(node.parent) && // Ignore import paths
                !ts.isExportDeclaration(node.parent) && // Ignore export paths
                !ts.isCaseClause(node.parent) && // Ignore switch-case strings
                !(
                    ts.isBinaryExpression(node.parent) &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.BarBarToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken
                ) && // ignore conditional expressions. If string is left-or-right-hand side of a conditional, we want to ignore it. However, coalescing operators and the operands of += we _do_ want to translate.
                !(
                    ts.isCallExpression(node.parent) &&
                    ts.isPropertyAccessExpression(node.parent.expression) &&
                    ((ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'console') ||
                        (ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'Log'))
                ))
        );
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
            if (ts.isStringLiteral(node)) {
                stringsToTranslate.set(StringUtils.hash(node.text), node.text);
            } else if (ts.isTemplateExpression(node)) {
                if (this.isSimpleTemplateExpression(node)) {
                    stringsToTranslate.set(StringUtils.hash(node.getText()), this.simpleTemplateExpressionToString(node));
                } else {
                    console.log('😵‍💫 Encountered complex template, recursively translating its spans first:', node.getText());
                    const hash = StringUtils.hash(node.getText());
                    node.templateSpans.forEach((span) => this.extractStringsToTranslate(span, stringsToTranslate));
                    stringsToTranslate.set(hash, this.complexTemplateExpressionToString(node));
                }
            }
        }
        node.forEachChild((child) => this.extractStringsToTranslate(child, stringsToTranslate));
    }

    /**
     * Convert a simple template expression into a plain string representation, without the backticks.
     */
    private simpleTemplateExpressionToString(expression: TemplateExpression): string {
        return expression.getText().trim().slice(1, -1);
    }

    /**
     * Convert a complex template expression into a plain string representation that can be predictably serialized.
     * All ${...} spans containing complex expressions are replaced in the string by hashes of the expression text.
     *
     * @example complexTemplateExpressionToString(`Edit ${action?.type === 'IOU' ? 'expense' : 'comment'} on ${date}`)
     *       => `Edit ${HASH1} on ${date}`
     */
    private complexTemplateExpressionToString(expression: TemplateExpression): string {
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

    private stringToSimpleTemplateExpression(input: string): ts.TemplateExpression {
        const regex = /\$\{([^}]*)}/g;
        const spans: ts.TemplateSpan[] = [];

        const matchIterator = input.matchAll(regex);

        const firstMatch = matchIterator.next();
        const headText = firstMatch.done ? input : input.slice(0, firstMatch.value.index);
        const templateHead = ts.factory.createTemplateHead(headText);

        // Reset iterator
        const matches = [...input.matchAll(regex)];

        for (let i = 0; i < matches.length; i++) {
            // eslint-disable-next-line rulesdir/prefer-at
            const match = matches[i];
            const [fullMatch, exprText] = match;
            const expr = ts.factory.createIdentifier(exprText.trim());

            const startOfMatch = match.index;
            const nextStaticTextStart = startOfMatch + fullMatch.length;
            const nextStaticTextEnd = i + 1 < matches.length ? matches.at(i + 1)?.index : input.length;
            const staticText = input.slice(nextStaticTextStart, nextStaticTextEnd);

            const literal = i === matches.length - 1 ? ts.factory.createTemplateTail(staticText) : ts.factory.createTemplateMiddle(staticText);

            spans.push(ts.factory.createTemplateSpan(expr, literal));
        }

        return ts.factory.createTemplateExpression(templateHead, spans);
    }

    private stringToComplexTemplateExpression(input: string, translatedComplexSpans: Map<number, ts.TemplateSpan>): ts.TemplateExpression {
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

                    if (ts.isTemplateExpression(node)) {
                        const translatedTemplate = translations.get(StringUtils.hash(node.getText()));
                        if (!translatedTemplate) {
                            console.warn('⚠️ No translation found for template expression', node.getText());
                            return node;
                        }

                        if (this.isSimpleTemplateExpression(node)) {
                            return this.stringToSimpleTemplateExpression(translatedTemplate);
                        }

                        // Template expression is complex: recursively translate all complex template spans first
                        const translatedComplexSpans = new Map<number, ts.TemplateSpan>();
                        for (const span of node.templateSpans) {
                            if (this.isSimpleTemplateSpan(span)) {
                                continue;
                            }
                            const hash = StringUtils.hash(span.expression.getText());
                            const translatedSpan = ts.visitNode(span, visit);
                            translatedComplexSpans.set(hash, translatedSpan as ts.TemplateSpan);
                        }

                        // Build the translated template expression, referencing the translated template spans as necessary
                        return this.stringToComplexTemplateExpression(translatedTemplate, translatedComplexSpans);
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

async function main(): Promise<void> {
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
        console.log('🍸 Dry run enabled');
    }

    // Ensure OPEN_AI_KEY is set in environment
    if (!isDryRun && !process.env.OPENAI_API_KEY) {
        dotenv.config({path: path.resolve(__dirname, '../.env')});
        if (!process.env.OPENAI_API_KEY) {
            console.error(`❌ OPENAI_API_KEY not found in environment.`);
        }
    }

    // Initialize OpenAI API
    let openai: OpenAI | undefined;
    if (!isDryRun) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    const languagesDir = process.env.LANGUAGES_DIR || path.join(__dirname, '../src/languages');
    const enSourceFile = path.join(languagesDir, 'en.ts');

    const generator = new TranslationGenerator({
        // TODO: cast to "as Locale" will not be necessary once more locales are added
        targetLanguages: ['it' as Locale],
        languagesDir,
        sourceFile: enSourceFile,
        openai,
    });
    await generator.generateTranslations();
}

if (require.main === module) {
    main();
}

export default main;
