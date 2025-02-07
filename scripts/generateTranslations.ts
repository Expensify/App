import {execSync} from 'child_process';
import fs from 'fs';
// import OpenAI from 'openai';
import path from 'path';
import ts from 'typescript';

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

// Extracts all string literals from the AST
function extractStrings(node: ts.Node, strings: Map<string, string>) {
    if (
        ts.isStringLiteral(node) &&
        node.parent && // Ensure the node has a parent
        !ts.isImportDeclaration(node.parent) && // Ignore import paths
        !ts.isExportDeclaration(node.parent) // Ignore export paths
    ) {
        strings.set(node.text, node.text);
    }
    node.forEachChild((child) => extractStrings(child, strings));
}

// Creates a transformer to replace strings with translations
function createTransformer(translations: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
        const visit: ts.Visitor = (node) => {
            if (
                ts.isStringLiteral(node) &&
                node.parent && // Ensure the node has a parent
                !ts.isImportDeclaration(node.parent) && // Ignore import paths
                !ts.isExportDeclaration(node.parent) // Ignore export paths
            ) {
                const translatedText = translations.get(node.text);
                return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
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
        // Step 1: Extract strings
        const stringsToTranslate = new Map<string, string>();
        extractStrings(sourceFile, stringsToTranslate);

        // Step 2: Translate them asynchronously
        const translations = new Map<string, string>();
        for (const [originalText] of stringsToTranslate) {
            const translatedText = await translate(originalText, lang);
            translations.set(originalText, translatedText);
        }

        // Step 3: Replace translated strings in the AST
        const result = ts.transform(sourceFile, [createTransformer(translations)]);
        const transformedNode = result.transformed.at(0) ?? sourceFile; // Ensure we always have a valid SourceFile
        result.dispose();

        // Step 4: Generate translated TypeScript code
        const printer = ts.createPrinter();
        const translatedCode = printer.printFile(transformedNode);

        // Step 5: Write to file
        const outputPath = `${LANGUAGES_DIR}/${lang}.ts`;
        fs.writeFileSync(outputPath, translatedCode, 'utf8');

        // Step 6: Format the files using prettier
        execSync(`npx prettier --write ${LANGUAGES_DIR}`);

        console.log(`✅ Translated file created: ${outputPath}`);
    }
}

// Execute the translation process
generateTranslatedFiles().catch(console.error);
