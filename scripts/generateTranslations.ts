import {execSync} from 'child_process';
import fs from 'fs';
// import OpenAI from 'openai';
import path from 'path';
import type {StringLiteral, TemplateExpression} from 'typescript';
import ts, {EmitHint} from 'typescript';

const LANGUAGES_DIR = path.join(__dirname, '../src/languages');

// Path to the English source file
const SOURCE_FILE = `${LANGUAGES_DIR}/en.ts`;

const TARGET_LANGUAGES = ['es'];

// Initialize OpenAI API
// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// Temporary placeholder for actual translation function
async function translate(text: string, targetLang: string): Promise<string> {
    return Promise.resolve(`[${targetLang}] ${text}`);
}

const tsPrinter = ts.createPrinter();
const debugFile = ts.createSourceFile('tempDebug.ts', '', ts.ScriptTarget.Latest);

// Helper function to call OpenAI for translation
// async function translateText(text: string, targetLang: string): Promise<string> {
//     try {
//         const response = await openai.chat.completions.create({
//             model: 'gpt-4',
//             messages: [
//                 {
//                     role: 'system',
//                     content: `You are a professional translator. Translate the following text to ${targetLang}. It is either a plain string or a TypeScript function that returns a template string. Preserve placeholders like {username}, {count}, etc without modifying their contents or removing the brackets. The contents of the placeholders are descriptive of what they represent in the phrase, but may include ternary expressions or other TypeScript code.`,
//                 },
//                 {role: 'user', content: text},
//             ],
//             temperature: 0.3,
//         });
//
//         return response.choices.at(0)?.message?.content?.trim() ?? text;
//     } catch (error) {
//         console.error(`Error translating "${text}" to ${targetLang}:`, error);
//         return text; // Fallback to English if translation fails
//     }
// }

function isPlainStringNode(node: ts.Node): node is StringLiteral {
    return (
        ts.isStringLiteral(node) &&
        !!node.parent && // Ensure the node has a parent
        !ts.isImportDeclaration(node.parent) && // Ignore import paths
        !ts.isExportDeclaration(node.parent) && // Ignore export paths
        !ts.isCaseClause(node.parent)
    ); // Ignore switch-case strings
}

function isTemplateExpressionNode(node: ts.Node): node is TemplateExpression {
    return ts.isTemplateExpression(node) && !!node.parent;
}

function templateExpressionToString(node: TemplateExpression): string {
    let result = node.head.text; // Start with TemplateHead text

    node.templateSpans.forEach((span) => {
        result += `\${${span.expression.getText()}}`; // Append placeholder
        result += span.literal.text; // Append static text after placeholder
    });

    return result;
}

function stringToTemplateExpression(input: string): ts.TemplateExpression {
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

function extractStrings(node: ts.Node, strings: Map<string, string>) {
    if (isPlainStringNode(node)) {
        strings.set(node.text, node.text);
    }
    node.forEachChild((child) => extractStrings(child, strings));
}

function extractTemplateExpressions(node: ts.Node, templateExpressions: Map<string, TemplateExpression>) {
    if (isTemplateExpressionNode(node)) {
        templateExpressions.set(templateExpressionToString(node), node);
    }
    node.forEachChild((child) => extractTemplateExpressions(child, templateExpressions));
}

function createTransformer(translations: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
        const visit: ts.Visitor = (node) => {
            if (isPlainStringNode(node)) {
                const translatedText = translations.get(node.text);
                // console.log(`🔵 Replacing String: "${node.text}" → "${translatedText}"`);
                return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
            }
            if (isTemplateExpressionNode(node)) {
                const originalTemplateExpressionAsString = templateExpressionToString(node);
                console.log(`🟡 Checking TemplateExpression: "${originalTemplateExpressionAsString}"`);
                const translatedTemplate = translations.get(originalTemplateExpressionAsString);
                if (translatedTemplate) {
                    console.log(`🔹 Found Translation: "${translatedTemplate}"`);
                    const translatedTemplateExpression = stringToTemplateExpression(translatedTemplate);
                    try {
                        // Try printing the expression to validate it
                        const printedCode = tsPrinter.printNode(EmitHint.Unspecified, translatedTemplateExpression, debugFile);
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

// Main function to process translations
async function generateTranslatedFiles() {
    const sourceCode = fs.readFileSync(SOURCE_FILE, 'utf8');
    const sourceFile = ts.createSourceFile(SOURCE_FILE, sourceCode, ts.ScriptTarget.Latest, true);

    for (const lang of TARGET_LANGUAGES) {
        // Extract strings
        const stringsToTranslate = new Map<string, string>();
        extractStrings(sourceFile, stringsToTranslate);

        // Extract templateExpressions
        const templatesToTranslate = new Map<string, TemplateExpression>();
        extractTemplateExpressions(sourceFile, templatesToTranslate);

        // Translate them asynchronously
        const translations = new Map<string, string>();
        for (const [originalText] of stringsToTranslate) {
            const translatedText = await translate(originalText, lang);
            translations.set(originalText, translatedText);
        }
        for (const [originalTemplateString, templateExpression] of templatesToTranslate) {
            const templateExpressionAsString = templateExpressionToString(templateExpression);
            const translatedTemplate = await translate(templateExpressionAsString, lang);
            translations.set(originalTemplateString, translatedTemplate);
        }

        // Replace translated strings in the AST
        const result = ts.transform(sourceFile, [createTransformer(translations)]);
        const transformedNode = result.transformed.at(0) ?? sourceFile; // Ensure we always have a valid SourceFile
        result.dispose();

        // Generate translated TypeScript code
        const printer = ts.createPrinter();
        const translatedCode = printer.printFile(transformedNode);

        // Write to file
        const outputPath = `${LANGUAGES_DIR}/${lang}.ts`;
        fs.writeFileSync(outputPath, translatedCode, 'utf8');

        // Format the files using prettier
        execSync(`npx prettier --write ${LANGUAGES_DIR}`);

        console.log(`✅ Translated file created: ${outputPath}`);
    }
}

// Execute the translation process
generateTranslatedFiles().catch(console.error);
