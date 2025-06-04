/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import type {TemplateExpression} from 'typescript';
import ts, {EmitHint} from 'typescript';
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

    /**
     * A typescript util that can print an AST to a string of source code.
     */
    private readonly tsPrinter: ts.Printer;

    /**
     * A debug utility that we use to validate at runtime that `stringToTemplateExpression` works for all use-cases.
     *
     * TODO: Remove this once recursive template processing is done and unit tested.
     */
    private readonly debugFile: ts.SourceFile;

    constructor(config: {targetLanguages: Locale[]; languagesDir: string; sourceFile: string; openai?: OpenAI}) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        this.sourceFile = config.sourceFile;
        this.openai = config.openai;
        this.tsPrinter = ts.createPrinter();
        this.debugFile = ts.createSourceFile('tempDebug.ts', '', ts.ScriptTarget.Latest);
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
            console.log(`🧠Translating "${text}" to ${targetLang}`);
            let result: string;
            if (this.openai) {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following text to ${targetLang}. It is either a plain string or a TypeScript function that returns a template string. Preserve placeholders like \${username}, \${count}, \${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc without modifying their contents or removing the brackets. The contents of the placeholders are descriptive of what they represent in the phrase, but may include ternary expressions or other TypeScript code. If it can't be translated, reply with the same text unchanged.`,
                        },
                        {role: 'user', content: text},
                    ],
                    temperature: 0.3,
                });
                result = response.choices.at(0)?.message?.content?.trim() ?? text;
            } else {
                result = `[${targetLang}] ${text}`;
            }
            console.log(`✏️Translated "${text}" to ${targetLang}: "${result}"`);
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
                !ts.isBinaryExpression(node.parent) && // ignore conditional expressions (string is left-or-right-hand side of a conditional, and we want to ignore it)
                !(
                    ts.isCallExpression(node.parent) &&
                    ts.isPropertyAccessExpression(node.parent.expression) &&
                    ((ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'console') ||
                        (ts.isIdentifier(node.parent.expression.expression) && node.parent.expression.expression.getText() === 'Log'))
                ))
        );
    }

    /**
     * Check if the given node is a template expression.
     */
    private isTemplateExpressionNode(node: ts.Node): node is TemplateExpression {
        return ts.isTemplateExpression(node) && !!node.parent;
    }

    /**
     * Recursively extract all string literals and templates from the subtree rooted at the given node.
     */
    private extractStringsToTranslate(node: ts.Node, stringsToTranslate: Map<number, string>) {
        if (this.shouldNodeBeTranslated(node)) {
            if (ts.isStringLiteral(node)) {
                stringsToTranslate.set(StringUtils.hash(node.text), node.text);
            } else if (ts.isTemplateExpression(node)) {
                stringsToTranslate.set(StringUtils.hash(this.templateExpressionToString(node)), this.templateExpressionToString(node));
            }
        }
        node.forEachChild((child) => this.extractStringsToTranslate(child, stringsToTranslate));
    }

    /**
     * Convert a template expression into a plain string representation, without the backticks.
     */
    private templateExpressionToString(expression: TemplateExpression): string {
        return expression.getFullText().trim().slice(1, -1);
    }

    /**
     * Convert a string representation of a template expression to a TemplateExpression AST node.
     */
    private stringToTemplateExpression(input: string): ts.TemplateExpression {
        const parts: Array<string | ts.Expression> = [];
        const regex = /\$\{((?:[^{}]|\$\{[^{}]*})*)}/g;
        let lastIndex = 0;

        for (const match of input.matchAll(regex)) {
            const [fullMatch, expr] = match;
            const index = match.index ?? 0;

            // Add static text before placeholder
            if (index > lastIndex) {
                parts.push(input.slice(lastIndex, index));
            }

            // Add the placeholder as an AST expression
            parts.push(ts.factory.createIdentifier(expr));

            lastIndex = index + fullMatch.length;
        }

        // Add remaining static text after last placeholder
        if (lastIndex < input.length) {
            parts.push(input.slice(lastIndex));
        }

        // Ensure we have at least one static text part
        const thingy = parts.at(0);
        const headText = typeof thingy === 'string' ? thingy : '';
        const templateHead = ts.factory.createTemplateHead(headText);

        // Create template spans
        const spans: ts.TemplateSpan[] = [];
        for (let i = 1; i < parts.length; i += 2) {
            const expr = parts.at(i) as ts.Expression;
            const literalText = i + 1 < parts.length ? (parts.at(i + 1) as string) : '';

            spans.push(ts.factory.createTemplateSpan(expr, i + 2 >= parts.length ? ts.factory.createTemplateTail(literalText) : ts.factory.createTemplateMiddle(literalText)));
        }

        return ts.factory.createTemplateExpression(templateHead, spans);
    }

    /**
     * Generate an AST transformer for the given set of translations.
     * @param translations
     */
    private createTransformer(translations: Map<number, string>): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            const visit: ts.Visitor = (node) => {
                if (ts.isStringLiteral(node) && this.shouldNodeBeTranslated(node)) {
                    const translatedText = translations.get(StringUtils.hash(node.text));
                    return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
                }
                if (this.isTemplateExpressionNode(node)) {
                    const originalTemplateExpressionAsString = this.templateExpressionToString(node);
                    console.log(`🟡 Checking TemplateExpression: "${originalTemplateExpressionAsString}"`);
                    const translatedTemplate = translations.get(StringUtils.hash(originalTemplateExpressionAsString));
                    if (translatedTemplate) {
                        console.log(`🔹 Found Translation: "${translatedTemplate}"`);
                        const translatedTemplateExpression = this.stringToTemplateExpression(translatedTemplate);
                        try {
                            // Try printing the expression to validate it
                            const printedCode = this.tsPrinter.printNode(EmitHint.Unspecified, translatedTemplateExpression, this.debugFile);
                            console.log(`🪇 Transforming translated template back to TemplateExpression: ${printedCode}`);
                        } catch (e) {
                            console.warn(`⚠️ Unhandled TemplateExpression: ${translatedTemplate}`);
                            return node;
                        }

                        return translatedTemplateExpression;
                    }
                    console.warn('⚠️ No translation found for template expression', originalTemplateExpressionAsString);
                    return node;
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
