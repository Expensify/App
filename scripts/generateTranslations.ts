#!/usr/bin/env ts-node

/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import type {StringLiteral, TemplateExpression} from 'typescript';
import ts, {EmitHint} from 'typescript';

const TARGET_LANGUAGES = ['it'];

const LANGUAGES_DIR = path.join(__dirname, '../src/languages');
const EN_SOURCE_FILE = path.join(LANGUAGES_DIR, 'en.ts');

const tsPrinter = ts.createPrinter();
const debugFile = ts.createSourceFile('tempDebug.ts', '', ts.ScriptTarget.Latest);

/**
 * Translate a single string to a target language.
 */
async function translate(text: string, targetLanguage: string): Promise<string> {
    return Promise.resolve(`[${targetLanguage}] ${text}`);
}

/**
 * Check if the given node is a string literal that is not part of an import, export, or switch-case statement..
 */
function isPlainStringNode(node: ts.Node): node is StringLiteral {
    return (
        ts.isStringLiteral(node) &&
        !!node.parent && // Ensure the node has a parent
        !ts.isImportDeclaration(node.parent) && // Ignore import paths
        !ts.isExportDeclaration(node.parent) && // Ignore export paths
        !ts.isCaseClause(node.parent) // Ignore switch-case strings
    );
}

/**
 * Check if the given node is a template expression.
 */
function isTemplateExpressionNode(node: ts.Node): node is TemplateExpression {
    return ts.isTemplateExpression(node) && !!node.parent;
}

/**
 * Recursively extract all string literals from the subtree rooted at the given node.
 */
function extractStrings(node: ts.Node, strings: Map<string, string>) {
    if (isPlainStringNode(node)) {
        strings.set(node.text, node.text);
    }
    node.forEachChild((child) => extractStrings(child, strings));
}

/**
 * Recursively extract all template expressions from the subtree rooted at the given node.
 */
function extractTemplateExpressions(node: ts.Node, templateExpressions: Map<string, TemplateExpression>) {
    if (isTemplateExpressionNode(node)) {
        templateExpressions.set(node.getFullText(), node);
    }
    node.forEachChild((child) => extractTemplateExpressions(child, templateExpressions));
}

/**
 * Convert a string representation of a template expression to a TemplateExpression AST node.
 */
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

/**
 * Generate an AST transformer for the given set of translations.
 * @param translations
 */
function createTransformer(translations: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
        const visit: ts.Visitor = (node) => {
            if (isPlainStringNode(node)) {
                const translatedText = translations.get(node.text);
                return translatedText ? ts.factory.createStringLiteral(translatedText) : node;
            }
            if (isTemplateExpressionNode(node)) {
                const originalTemplateExpressionAsString = node.getFullText();
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

async function main() {
    const sourceCode = fs.readFileSync(EN_SOURCE_FILE, 'utf8');
    const sourceFile = ts.createSourceFile(EN_SOURCE_FILE, sourceCode, ts.ScriptTarget.Latest, true);

    for (const targetLanguage of TARGET_LANGUAGES) {
        // Extract strings
        const stringsToTranslate = new Map<string, string>();
        extractStrings(sourceFile, stringsToTranslate);

        // Extract templateExpressions
        const templatesToTranslate = new Map<string, TemplateExpression>();
        extractTemplateExpressions(sourceFile, templatesToTranslate);

        // Transform the template expressions to strings and add them to the map
        for (const [key, templateExpression] of templatesToTranslate) {
            stringsToTranslate.set(key, templateExpression.getFullText());
        }

        const translations = new Map<string, string>();
        for (const [key, value] of stringsToTranslate) {
            translations.set(key, await translate(value, targetLanguage));
        }

        // Replace translated strings in the AST
        const result = ts.transform(sourceFile, [createTransformer(translations)]);
        const transformedNode = result.transformed.at(0) ?? sourceFile; // Ensure we always have a valid SourceFile
        result.dispose();

        // Generate translated TypeScript code
        const printer = ts.createPrinter();
        const translatedCode = printer.printFile(transformedNode);

        // Write to file
        const outputPath = `${LANGUAGES_DIR}/${targetLanguage}.ts`;
        fs.writeFileSync(outputPath, translatedCode, 'utf8');

        console.log(`✅ Translated file created: ${outputPath}`);
    }

    // Format the files using prettier
    execSync(`npx prettier --write ${LANGUAGES_DIR}`);
}

if (require.main === module) {
    main();
}
