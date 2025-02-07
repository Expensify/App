import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const LANGUAGES_DIR = path.join(__dirname, '../src/languages');
const SOURCE_FILE = `${LANGUAGES_DIR}/en.ts`;
const TARGET_LANGUAGES = ['es'];

async function translate(text: string, targetLang: string): Promise<string> {
    console.log(`🟢 Sending text for translation: "${text}" → ${targetLang}`);
    return Promise.resolve(`[${targetLang}] ${text}`);
}

/** Checks if a node is a plain string literal */
function isPlainStringNode(node: ts.Node): node is ts.StringLiteral {
    return ts.isStringLiteral(node) && !!node.parent && !ts.isImportDeclaration(node.parent) && !ts.isExportDeclaration(node.parent) && !ts.isCaseClause(node.parent);
}

/** Checks if a node is a template expression */
function isTemplateExpressionNode(node: ts.Node): node is ts.TemplateExpression {
    return ts.isTemplateExpression(node) && !!node.parent;
}

/** Determines if a template is "simple" (only identifiers) or "complex" */
function isSimpleTemplate(node: ts.TemplateExpression): boolean {
    return node.templateSpans.every((span) => ts.isIdentifier(span.expression));
}

/** Converts a `TemplateExpression` into a string */
function templateExpressionToString(node: ts.TemplateExpression): string {
    let result = node.head.text;
    node.templateSpans.forEach((span) => {
        result += `\${${span.expression.getText()}}`;
        result += span.literal.text;
    });
    return result;
}

/** Converts a translated string back into a TemplateExpression */
function stringToTemplateExpression(input: string, translations: Map<string, ts.TemplateExpression>): ts.TemplateExpression {
    const tsPrinter = ts.createPrinter();
    const debugFile = ts.createSourceFile('debug.ts', '', ts.ScriptTarget.Latest);
    const parts: Array<string | ts.Expression> = [];

    // Updated regex to correctly extract multiple placeholders without merging them
    const regex = /\$\{([^}]+)}/g;
    let lastIndex = 0;

    for (const match of input.matchAll(regex)) {
        const [fullMatch, expr] = match;
        const index = match.index ?? 0;

        // Capture static text before the placeholder
        if (index > lastIndex) {
            parts.push(input.slice(lastIndex, index));
        }

        // Ensure each placeholder is correctly translated or used as an identifier
        const translatedExpression = translations.get(expr.trim());
        if (translatedExpression) {
            console.log(`🔄 Replacing placeholder with translated AST: "${expr}"`);
            parts.push(translatedExpression);
        } else {
            parts.push(ts.factory.createIdentifier(expr.trim()));
        }

        lastIndex = index + fullMatch.length;
    }

    // Capture any remaining static text after the last placeholder
    if (lastIndex < input.length) {
        parts.push(input.slice(lastIndex));
    }

    // Ensure the first segment is a string
    const thingy = parts.at(0);
    const headText = typeof thingy === 'string' ? thingy : '';
    const templateHead = ts.factory.createTemplateHead(headText);
    const spans: ts.TemplateSpan[] = [];

    for (let i = 1; i < parts.length; i++) {
        const expr = parts.at(i) as ts.Expression;
        const literalText = i + 1 < parts.length && typeof parts.at(i + 1) === 'string' ? (parts.at(i + 1) as string) : '';

        spans.push(ts.factory.createTemplateSpan(expr, i + 1 >= parts.length ? ts.factory.createTemplateTail(literalText) : ts.factory.createTemplateMiddle(literalText)));

        if (typeof parts.at(i + 1) === 'string') {
            i++;
        }
    }

    try {
        const result = ts.factory.createTemplateExpression(templateHead, spans);
        console.log(`✅ Successfully created TemplateExpression: ${tsPrinter.printNode(ts.EmitHint.Unspecified, result, debugFile)}`);
        return result;
    } catch (error) {
        console.error(`❌ Error creating TemplateExpression:`, error);
        console.error(`❌ Raw input string: ${input}`);
        throw error;
    }
}

/** Processes all string literals and simple template literals in the AST */
async function processLiterals(sourceFile: ts.SourceFile): Promise<ts.SourceFile> {
    const translations = new Map<string, string>();
    const nodesToTranslate: string[] = [];

    function collectLiterals(node: ts.Node) {
        if (isPlainStringNode(node) && !translations.has(node.text)) {
            nodesToTranslate.push(node.text);
        }
        if (isTemplateExpressionNode(node) && isSimpleTemplate(node)) {
            const templateString = templateExpressionToString(node);
            if (!translations.has(templateString)) {
                nodesToTranslate.push(templateString);
            }
        }
        node.forEachChild(collectLiterals);
    }
    collectLiterals(sourceFile);

    // Translate all collected strings and simple templates asynchronously
    for (const text of nodesToTranslate) {
        const translatedText = await translate(text, 'es');
        translations.set(text, translatedText);
    }

    // Transformer function (synchronous now)
    function transformLiterals(context: ts.TransformationContext) {
        return (node: ts.SourceFile) => {
            function visit(n: ts.Node): ts.Node {
                if (isPlainStringNode(n) && translations.has(n.text)) {
                    const translatedText = translations.get(n.text);
                    if (translatedText) {
                        console.log(`🔵 Replacing string: "${n.text}" → "${translations.get(n.text)}"`);
                        return ts.factory.createStringLiteral(translatedText);
                    }
                }
                if (isTemplateExpressionNode(n) && isSimpleTemplate(n)) {
                    const templateString = templateExpressionToString(n);
                    const translatedTemplateString = translations.get(templateString);
                    if (translatedTemplateString) {
                        console.log(`🟡 Replacing simple template: "${templateString}"`);
                        return stringToTemplateExpression(translatedTemplateString, new Map());
                    }
                }
                return ts.visitEachChild(n, visit, context);
            }
            return ts.visitNode(node, visit) as ts.SourceFile;
        };
    }

    const transformedResult = ts.transform(sourceFile, [transformLiterals]);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transformedSourceFile = transformedResult.transformed.at(0)!;
    transformedResult.dispose();

    return transformedSourceFile;
}

/** Main function to process translations */
async function generateTranslatedFiles() {
    const sourceCode = fs.readFileSync(SOURCE_FILE, 'utf8');
    const sourceFile = ts.createSourceFile(SOURCE_FILE, sourceCode, ts.ScriptTarget.Latest, true);

    for (const lang of TARGET_LANGUAGES) {
        const transformedNode = await processLiterals(sourceFile);

        const printer = ts.createPrinter();
        const translatedCode = printer.printFile(transformedNode);

        const outputPath = `${LANGUAGES_DIR}/${lang}.ts`;
        fs.writeFileSync(outputPath, translatedCode, 'utf8');

        execSync(`npx prettier --write ${LANGUAGES_DIR}`);

        console.log(`✅ Translated file created: ${outputPath}`);
    }
}

generateTranslatedFiles().catch(console.error);
