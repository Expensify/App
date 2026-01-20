#!/usr/bin/env npx ts-node
/*
 * This script uses src/languages/en.ts as the source of truth, and leverages ChatGPT to generate translations for other languages.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import get from 'lodash/get';
import path from 'path';
import type {TemplateExpression} from 'typescript';
import ts from 'typescript';
import decodeUnicode from '@libs/StringUtils/decodeUnicode';
import dedent from '@libs/StringUtils/dedent';
import hashStr from '@libs/StringUtils/hash';
import baseTranslationPrompt from '@prompts/translation/base';
import contextPrompt from '@prompts/translation/context';
import {isTranslationTargetLocale, LOCALES, TRANSLATION_TARGET_LOCALES} from '@src/CONST/LOCALES';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import en from '@src/languages/en';
import type {TranslationPaths} from '@src/languages/types';
import ChatGPTCostEstimator from './chatGPTCostEstimator';
import CLI from './utils/CLI';
import COLORS from './utils/COLORS';
import Git from './utils/Git';
import Prettier from './utils/Prettier';
import PromisePool from './utils/PromisePool';
import ChatGPTTranslator from './utils/Translator/ChatGPTTranslator';
import DummyTranslator from './utils/Translator/DummyTranslator';
import type Translator from './utils/Translator/Translator';
import TSCompilerUtils, {TransformerAction} from './utils/TSCompilerUtils';
import type {TransformerResult} from './utils/TSCompilerUtils';

/**
 * This represents a string to translate. In the context of translation, two strings are considered equal only if their contexts are also equal.
 */
type StringWithContext = {
    text: string;
    context?: string;
};

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

const tsPrinter = ts.createPrinter();

/**
 * If the estimated cost of translation exceeds this threshold (in USD), prompt the user for confirmation before proceeding.
 */
const COST_CONFIRMATION_THRESHOLD = 1;

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
    /**
     * Regex to match context annotations.
     */
    private static readonly CONTEXT_REGEX = /^\s*(?:\/{2}|\*|\/\*)?\s*@context\s+([^\n*/]+)/;

    /**
     * The languages to generate translations for.
     */
    private readonly targetLanguages: TranslationTargetLocale[];

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

    /**
     * Ref to use for existing translations.
     */
    private readonly compareRef: string;

    /**
     * Paths to add (don't exist in target file yet).
     */
    private readonly pathsToAdd: Set<TranslationPaths>;

    /**
     * Paths to modify (exist in target file and need retranslation).
     */
    private readonly pathsToModify: Set<TranslationPaths>;

    /**
     * Paths to remove (only populated when using compareRef).
     */
    private readonly pathsToRemove: Set<TranslationPaths>;

    /**
     * Should we print verbose logs?
     */
    private readonly verbose: boolean;

    /**
     * Is this an incremental translation run, or a full translation run?
     */
    private readonly isIncremental: boolean;

    /**
     * CLI instance for user prompts.
     */
    /* eslint-disable @typescript-eslint/naming-convention */
    private readonly cli: CLI<{
        flags: {
            'dry-run': {description: string};
            verbose: {description: string};
        };
        namedArgs: {
            locales: {description: string; default: TranslationTargetLocale[]; parse: (val: string) => TranslationTargetLocale[]};
            'compare-ref': {description: string; default: string; parse: (val: string) => string};
            paths: {description: string; parse: (val: string) => Set<TranslationPaths>; supersedes: string[]; required: false};
        };
    }>;
    /* eslint-enable @typescript-eslint/naming-convention */

    /**
     * If a complex template expression comes from an existing translation file rather than ChatGPT, then the hashes of its spans will be serialized from the translated version of those spans.
     * This map provides us a way to look up the English hash for each translated span hash, so that when we're transforming the English file and we encounter a translated expression hash,
     * we can look up English hash and use it to look up the translation for that hash (since the translation map is keyed by English string hashes).
     */
    private readonly translatedSpanHashToEnglishSpanHash = new Map<number, number>();

    /**
     * Set of translation keys for strings that are arguments to dedent() calls.
     * These need special handling to preserve whitespace structure.
     */
    private readonly dedentStringKeys = new Set<number>();

    constructor() {
        this.languagesDir = process.env.LANGUAGES_DIR ?? path.join(__dirname, '../src/languages');
        const enSourceFile = path.join(this.languagesDir, 'en.ts');

        /* eslint-disable @typescript-eslint/naming-convention */
        this.cli = new CLI({
            flags: {
                'dry-run': {
                    description: 'If true, just do local mocked translations rather than making real requests to an AI translator.',
                },
                verbose: {
                    description: 'Should we print verbose logs?',
                },
            },
            namedArgs: {
                locales: {
                    description: 'Locales to generate translations for.',
                    default: Object.values(TRANSLATION_TARGET_LOCALES).filter((locale) => locale !== LOCALES.ES),
                    parse: (val: string): TranslationTargetLocale[] => {
                        const rawLocales = val.split(',');
                        const validatedLocales: TranslationTargetLocale[] = [];
                        for (const locale of rawLocales) {
                            if (!isTranslationTargetLocale(locale)) {
                                throw new Error(`Invalid locale ${String(locale)}`);
                            }
                            validatedLocales.push(locale);
                        }
                        return validatedLocales;
                    },
                },
                'compare-ref': {
                    description:
                        'For incremental translations, this ref is the previous version of the codebase to compare to. Only strings that changed or had their context changed since this ref will be retranslated.',
                    default: '',
                    parse: (val: string): string => {
                        if (!val.trim()) {
                            return val;
                        }
                        if (!Git.isValidRef(val)) {
                            throw new Error(`Invalid git reference: "${val}". Please provide a valid branch, tag, or commit hash.`);
                        }
                        return val;
                    },
                },
                paths: {
                    description: 'Comma-separated list of specific translation paths to retranslate (e.g., "common.save,errors.generic").',
                    parse: (val: string): Set<TranslationPaths> => {
                        const rawPaths = val.split(',').map((translationPath) => translationPath.trim());
                        const validatedPaths = new Set<TranslationPaths>();
                        const invalidPaths: string[] = [];
                        for (const rawPath of rawPaths) {
                            if (get(en, rawPath)) {
                                validatedPaths.add(rawPath as TranslationPaths);
                            } else {
                                invalidPaths.push(rawPath);
                            }
                        }
                        if (invalidPaths.length > 0) {
                            throw new Error(`found the following invalid paths: ${JSON.stringify(invalidPaths)}`);
                        }
                        return validatedPaths;
                    },
                    supersedes: ['compare-ref'],
                    required: false,
                },
            },
        } as const);
        /* eslint-enable @typescript-eslint/naming-convention */

        this.targetLanguages = this.cli.namedArgs.locales;
        this.compareRef = this.cli.namedArgs['compare-ref'];
        this.pathsToAdd = new Set<TranslationPaths>();
        this.pathsToModify = this.cli.namedArgs.paths ?? new Set<TranslationPaths>();
        this.pathsToRemove = new Set<TranslationPaths>();
        this.verbose = this.cli.flags.verbose;
        this.isIncremental = this.pathsToModify.size > 0 || !!this.compareRef;

        const sourceCode = fs.readFileSync(enSourceFile, 'utf8');
        this.sourceFile = ts.createSourceFile(enSourceFile, sourceCode, ts.ScriptTarget.Latest, true);

        if (this.cli.flags['dry-run']) {
            console.log('🍸 Dry run enabled');
            this.translator = new DummyTranslator();
        } else {
            if (!process.env.OPENAI_API_KEY) {
                dotenv.config({path: path.resolve(__dirname, '../.env')});
                if (!process.env.OPENAI_API_KEY) {
                    throw new Error('❌ OPENAI_API_KEY not found in environment.');
                }
            }
            this.translator = new ChatGPTTranslator(process.env.OPENAI_API_KEY);
        }
    }

    public async generateTranslations(): Promise<void> {
        const promisePool = new PromisePool();

        // map of translations for each locale
        const translations = new Map<TranslationTargetLocale, Map<number, string>>();

        if (this.isIncremental && this.pathsToModify.size === 0) {
            // If compareRef is provided (and no specific paths), use git diff to find changed lines and build dot-notation paths
            this.buildPathsFromGitDiff();
        }

        if (this.verbose) {
            console.log(`🎯 Initial path sets:`);
            console.log(`   pathsToModify: ${Array.from(this.pathsToModify).join(', ')}`);
            console.log(`   pathsToAdd: ${Array.from(this.pathsToAdd).join(', ')}`);
            console.log(`   pathsToRemove: ${Array.from(this.pathsToRemove).join(', ')}`);
        }

        // Extract strings to translate once (locale-independent)
        const stringsToTranslate = new Map<number, StringWithContext>();
        this.extractStringsToTranslate(this.sourceFile, stringsToTranslate);

        // Estimate cost and prompt user if needed (respects --yes/--no flags)
        await this.promptForCostApproval(stringsToTranslate);

        for (const targetLanguage of this.targetLanguages) {
            // Map of translations
            const translationsForLocale = translations.get(targetLanguage) ?? new Map<number, string>();

            // Translate all the strings in parallel (up to 8 at a time)
            const translationPromises = [];
            for (const [key, {text, context}] of stringsToTranslate) {
                if (translationsForLocale.has(key)) {
                    // This means that the translation for this key was already parsed from an existing translation file, so we don't need to translate it with ChatGPT
                    continue;
                }

                // Special handling for dedent strings - preserve leading newline
                let textToTranslate = text;
                let hadLeadingNewline = false;
                if (this.dedentStringKeys.has(key)) {
                    hadLeadingNewline = text.startsWith('\n');
                    textToTranslate = dedent(text);
                }

                const translationPromise = promisePool.add(async () => {
                    let result = await this.translator.translate(targetLanguage, textToTranslate, context);

                    // Special handling for dedent strings - add back leading newline if it was removed
                    if (hadLeadingNewline) {
                        result = `\n${result}`;
                    }

                    translationsForLocale.set(key, result);
                });
                translationPromises.push(translationPromise);
            }
            await Promise.allSettled(translationPromises);

            // Replace translated strings in the AST
            let transformedSourceFile: ts.SourceFile;

            if (this.isIncremental) {
                // Make sure the target file exists
                const targetPath = path.join(this.languagesDir, `${targetLanguage}.ts`);
                if (!fs.existsSync(targetPath)) {
                    throw new Error(`Target file ${targetPath} does not exist for incremental translation`);
                }

                // Transform en.ts with path filtering for pathsToModify and pathsToAdd.
                // The result is a "patch" of the main translations node, including only the paths that are added or modified,
                // where the values are translated to the target language.
                const enResult = ts.transform(this.sourceFile, [this.createTranslationTransformer(translationsForLocale)]);
                const transformedEnSourceFile = enResult.transformed.at(0);
                if (!transformedEnSourceFile) {
                    throw new Error('Failed to create translated patch from en.ts');
                }

                // Extract translated code strings from the transformed en.ts
                const translatedCodeMap = new Map<string, string>();
                this.extractTranslatedNodes(transformedEnSourceFile, translatedCodeMap);
                enResult.dispose();

                // Transform the target file using the translated node map
                const existingContent = fs.readFileSync(targetPath, 'utf8');
                const existingSourceFile = ts.createSourceFile(targetPath, existingContent, ts.ScriptTarget.Latest, true);
                const targetTransformer = this.createIncrementalTargetTransformer(translatedCodeMap);
                const targetResult = ts.transform(existingSourceFile, [targetTransformer]);
                const transformedTargetResult = targetResult.transformed.at(0);
                if (!transformedTargetResult) {
                    throw new Error('Failed to transform target file');
                }
                transformedSourceFile = transformedTargetResult;
                targetResult.dispose();
            } else {
                // Full transformation for non-incremental mode - transform en.ts
                const transformer = this.createTranslationTransformer(translationsForLocale);
                const result = ts.transform(this.sourceFile, [transformer]);
                transformedSourceFile = result.transformed.at(0) ?? this.sourceFile;
                result.dispose();
            }

            // Import en.ts (addImport will check if it already exists)
            transformedSourceFile = TSCompilerUtils.addImport(transformedSourceFile, 'en', './en', true);

            // Generate translated TypeScript code
            const translatedCode = decodeUnicode(tsPrinter.printFile(transformedSourceFile));

            // Write to file
            const outputPath = path.join(this.languagesDir, `${targetLanguage}.ts`);
            fs.writeFileSync(outputPath, translatedCode, 'utf8');

            // Enforce that the type of translated files matches en.ts
            let finalFileContent = fs.readFileSync(outputPath, 'utf8');
            finalFileContent = finalFileContent.replace('const translations = {', 'const translations: TranslationDeepObject<typeof en> = {');
            finalFileContent = finalFileContent.replace('export default translations satisfies TranslationDeepObject<typeof translations>;', 'export default translations;');

            // Add a fun ascii art touch with a helpful message
            if (!finalFileContent.startsWith(GENERATED_FILE_PREFIX)) {
                finalFileContent = `${GENERATED_FILE_PREFIX}${finalFileContent}`;
            }

            fs.writeFileSync(outputPath, finalFileContent, 'utf8');

            // Format the file with prettier
            await Prettier.format(outputPath);

            // Apply dedent formatting after Prettier so we have accurate source positions
            this.formatDedentCallsInFile(outputPath);

            // Format again with Prettier to ensure consistent formatting after dedent transformation
            await Prettier.format(outputPath);

            console.log(`✅ Translated file created: ${outputPath}`);
        }
    }

    /**
     * Estimates the cost of translating the given strings and prompts the user for confirmation if the cost exceeds the threshold.
     * If the user declines, the process exits.
     * Skips prompting in dry-run mode since no real API calls are made.
     */
    private async promptForCostApproval(stringsToTranslate: Map<number, StringWithContext>): Promise<void> {
        // Skip cost check in dry-run mode since no real API calls are made (cost is $0)
        if (this.cli.flags['dry-run']) {
            return;
        }

        const numStrings = stringsToTranslate.size;
        const numLocales = this.targetLanguages.length;

        // Calculate base prompt tokens (use first target language as sample since length is similar across locales)
        const basePromptTokens = Math.ceil(baseTranslationPrompt(TRANSLATION_TARGET_LOCALES.DE).length * ChatGPTCostEstimator.TOKENS_PER_CHAR);

        // Calculate total input and output tokens for all strings
        let totalInputTokens = numStrings * basePromptTokens;
        let totalOutputTokens = 0;
        for (const {text, context} of stringsToTranslate.values()) {
            const tokensForString = Math.ceil(text.length * ChatGPTCostEstimator.TOKENS_PER_CHAR);

            // The inputs and outputs for the string are assumed to be about the same length.
            totalInputTokens += tokensForString;
            totalOutputTokens += tokensForString;

            // Add context prompt tokens if context exists
            if (context) {
                totalInputTokens += Math.ceil(contextPrompt(context).length * ChatGPTCostEstimator.TOKENS_PER_CHAR);
            }
        }

        // Multiply total input and output tokens by the number of locales
        totalInputTokens *= numLocales;
        totalOutputTokens *= numLocales;

        const estimatedCost = ChatGPTCostEstimator.getTotalEstimatedCost(totalInputTokens, totalOutputTokens);

        if (estimatedCost > COST_CONFIRMATION_THRESHOLD) {
            console.warn(
                `${COLORS.YELLOW}${dedent(`
                    ⚠️  Warning: This translation will cost approximately $${estimatedCost.toFixed(2)} USD.
                       Strings to translate: ${stringsToTranslate.size.toLocaleString()}
                       Target locales: ${numLocales}
                `)}${COLORS.RESET}`,
            );

            if (!this.isIncremental) {
                const scriptPath = path.relative(process.cwd(), path.resolve(__dirname, 'generateTranslations.ts'));
                console.log(
                    `Note: You are currently running a full retranslation of the entire \`en.ts\` file. To incrementally translate only what you changed on your branch, run: ${COLORS.BLUE}\`npx ts-node ${scriptPath} --compare-ref main\`${COLORS.RESET}\n`,
                );
            }

            const userConfirmed = await this.cli.promptUserConfirmation(`Do you want to proceed? ${COLORS.BOLD}Estimated cost: $${estimatedCost.toFixed(2)} USD.${COLORS.RESET} (y/n) `);

            if (!userConfirmed) {
                console.log('\n❌ Translation cancelled by user.');
                process.exit(0);
            }

            console.log('\n✅ Proceeding with translation...\n');
        }
    }

    /**
     * Each translation file should have an object called translations that's later default-exported.
     * This function finds that object for a given SourceFile
     */
    private findTranslationsNode(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression {
        const defaultExport = TSCompilerUtils.findDefaultExport(sourceFile);
        if (!defaultExport) {
            throw new Error('Could not find default export in source file');
        }
        const defaultExportIdentifier = TSCompilerUtils.extractIdentifierFromExpression(defaultExport);
        const variableDeclaration = TSCompilerUtils.resolveDeclaration(defaultExportIdentifier ?? '', sourceFile);

        if (!variableDeclaration || !ts.isVariableDeclaration(variableDeclaration) || !variableDeclaration.initializer) {
            throw new Error('Could not find translations object literal in source file');
        }

        if (!ts.isObjectLiteralExpression(variableDeclaration.initializer)) {
            throw new Error('Default export is not an object literal expression');
        }

        return variableDeclaration.initializer;
    }

    /**
     * Should we translate the given node?
     */
    private shouldTranslateNode(node: ts.Node): node is ts.StringLiteral | ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral {
        // We only translate string literals and template expressions
        if (!ts.isStringLiteral(node) && !ts.isTemplateExpression(node) && !ts.isNoSubstitutionTemplateLiteral(node)) {
            return false;
        }

        // Don't translate property keys (the name part of property assignments)
        if (node.parent && ts.isPropertyAssignment(node.parent) && node.parent.name === node) {
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
                // any binary expression except coalescing operators, += operators, and string concatenation
                (ts.isBinaryExpression(node.parent) &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.BarBarToken &&
                    node.parent.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken &&
                    // Allow string concatenation with +
                    !(node.parent.operatorToken.kind === ts.SyntaxKind.PlusToken && TSCompilerUtils.isStringConcatenationChain(node.parent))));

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

        // Don't translate object keys
        if (ts.isComputedPropertyName(node.parent)) {
            return false;
        }

        // Only translate string literals if they contain at least one real letter
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            // \p{L} matches a-z, à-ö, Α-Ω, Ж, 文, …  – but NOT digits, emoji, punctuation, etc.
            return /\p{L}/u.test(node.text);
        }

        // Only translate a template expression if it contains alphabet characters outside the spans
        let staticText = node.head.text;
        for (const span of node.templateSpans) {
            staticText += span.literal.text;
        }
        return /[a-zA-Z]/.test(staticText);
    }

    /**
     * Check if a given translation path should be translated based on the paths filter.
     * If no paths are specified, all paths should be translated.
     * If paths are specified, only paths that match exactly or are nested under a specified path should be translated.
     */
    private shouldTranslatePath(currentPath: string): boolean {
        if (!this.isIncremental) {
            return true;
        }

        // Check if path is in either pathsToModify or pathsToAdd
        const allPathsToTranslate = new Set([...this.pathsToModify, ...this.pathsToAdd]);
        for (const targetPath of allPathsToTranslate) {
            if (currentPath.startsWith(targetPath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a node is a direct argument to a dedent() call.
     */
    private isArgumentToDedent(node: ts.Node): boolean {
        if (!node.parent || !ts.isCallExpression(node.parent)) {
            return false;
        }

        const callExpression = node.parent;
        return ts.isIdentifier(callExpression.expression) && callExpression.expression.text === 'dedent' && callExpression.arguments.includes(node as ts.Expression);
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
     * Extract context annotation value from a string (comment or text).
     * Returns the context value if found, undefined otherwise.
     */
    private extractContextAnnotationFromString(text: string): string | undefined {
        const match = text.match(TranslationGenerator.CONTEXT_REGEX);
        return match?.[1].trim();
    }

    /**
     * Check if a specific line in the source file contains a context annotation.
     */
    private lineContainsContextAnnotation(lineNumber: number, sourceFile: ts.SourceFile): boolean {
        const lines = sourceFile.getFullText().split('\n');
        const line = lines.at(lineNumber - 1); // Convert to 0-based index
        if (!line) {
            return false;
        }
        return this.extractContextAnnotationFromString(line) !== undefined;
    }

    /**
     * Extract any leading context annotation for a given node.
     */
    private getContextForNode(node: ts.Node): string | undefined {
        // First, check for an inline context comment
        const inlineContext = this.extractContextAnnotationFromString(node.getFullText());
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
            const context = this.extractContextAnnotationFromString(commentText);
            if (context) {
                return context;
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
            .replaceAll(/^['"`]/g, '')
            .replaceAll(/['"`]$/g, '');

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
    private extractStringsToTranslate(node: ts.Node, stringsToTranslate: Map<number, StringWithContext>, currentPath = '') {
        if (this.shouldTranslateNode(node)) {
            // Check if this translation path should be included based on the paths filter
            if (!this.shouldTranslatePath(currentPath)) {
                return; // Skip this node and its children if the path doesn't match
            }

            const context = this.getContextForNode(node);
            const translationKey = this.getTranslationKey(node);

            // Track if this node is an argument to dedent()
            if (this.isArgumentToDedent(node)) {
                this.dedentStringKeys.add(translationKey);
            }

            // String literals and no-substitution templates can be translated directly
            if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
                stringsToTranslate.set(translationKey, {text: node.text, context});
            }

            // Template expressions must be encoded directly before they can be translated
            else if (ts.isTemplateExpression(node)) {
                if (this.isSimpleTemplateExpression(node)) {
                    stringsToTranslate.set(translationKey, {text: this.templateExpressionToString(node), context});
                } else {
                    if (this.verbose) {
                        console.debug('😵‍💫 Encountered complex template, recursively translating its spans first:', node.getText());
                    }
                    for (const span of node.templateSpans) {
                        this.extractStringsToTranslate(span, stringsToTranslate, currentPath);
                    }
                    stringsToTranslate.set(translationKey, {text: this.templateExpressionToString(node), context});
                }
            }
        }

        node.forEachChild(
            TSCompilerUtils.createPathAwareVisitor((child, childPath) => {
                this.extractStringsToTranslate(child, stringsToTranslate, childPath);
            }, currentPath),
        );
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

                // If the translated, serialized template expression came from an existing translation file, then the hash of the complex expression will be a hash of the translated expression.
                // If the translated, serialized template expression came from ChatGPT, then the hash of the complex expression will be a hash of the English expression.
                // Meanwhile, translatedComplexExpressions is keyed by English hashes, because it comes from createTransformer, which is parsing and transforming an English file.
                // So when rebuilding the template expression from its serialized form, we first search for the translated expression assuming the expression is serialized with English hashes.
                // If that fails, we look up the English expression hash associated with the translated expression hash, then look up the translated expression using the English hash.
                const translatedExpression = translatedComplexExpressions.get(hashed) ?? translatedComplexExpressions.get(this.translatedSpanHashToEnglishSpanHash.get(hashed) ?? hashed);

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
     * Build dot-notation paths from git diff by analyzing changed lines.
     */
    private buildPathsFromGitDiff(): void {
        try {
            // Get the relative path from the git repo root
            const relativePath = path.relative(process.cwd(), path.join(this.languagesDir, 'en.ts'));

            // Run git diff to find changed lines
            const diffResult = Git.diff(this.compareRef, undefined, relativePath);

            if (!diffResult.hasChanges) {
                if (this.verbose) {
                    console.log('🔍 No changes detected in git diff');
                }
                return;
            }

            // Find the main translation object in en.ts
            const translationsNode = this.findTranslationsNode(this.sourceFile);

            // Get changed lines from the diff
            const changedLines = diffResult.files.at(0);
            if (!changedLines) {
                return;
            }

            if (this.verbose) {
                console.log(`🔍 Found ${changedLines.addedLines.size} added lines, ${changedLines.removedLines.size} removed lines, ${changedLines.modifiedLines.size} modified lines`);
            }

            // Traverse current en.ts for added and modified paths
            this.extractPathsFromChangedLines(translationsNode, new Set([...changedLines.addedLines, ...changedLines.modifiedLines]), changedLines.removedLines);

            // For removed paths, we need to traverse the old version of en.ts
            if (changedLines.removedLines.size > 0) {
                this.extractRemovedPaths(changedLines.removedLines);
            }

            // Handle the case where the same path has both additions and removals (treat as modified, not deleted)
            // Also check if removed paths still exist in en.ts (partial removal within function)
            for (const removedPath of this.pathsToRemove) {
                if (this.pathsToModify.has(removedPath)) {
                    this.pathsToRemove.delete(removedPath); // It's modified, not removed
                } else if (get(en, removedPath) !== undefined) {
                    // Path still exists in en.ts, so it's modified not removed
                    this.pathsToRemove.delete(removedPath);
                    this.pathsToModify.add(removedPath);
                }
            }

            // Classify pathsToModify into actual modify vs add based on target file existence
            // We need to check against each target language file to properly classify paths
            for (const targetLanguage of this.targetLanguages) {
                const targetPath = path.join(this.languagesDir, `${targetLanguage}.ts`);

                if (fs.existsSync(targetPath)) {
                    const existingContent = fs.readFileSync(targetPath, 'utf8');
                    const existingSourceFile = ts.createSourceFile(targetPath, existingContent, ts.ScriptTarget.Latest, true);

                    // Check each path in pathsToModify to see if it actually exists in this target file
                    const existingTranslationsNode = this.findTranslationsNode(existingSourceFile);
                    for (const pathToCheck of this.pathsToModify) {
                        if (!TSCompilerUtils.objectHas(existingTranslationsNode, pathToCheck)) {
                            this.pathsToModify.delete(pathToCheck);
                            this.pathsToAdd.add(pathToCheck);
                        }
                    }

                    // Break after first existing target file since path classification should be consistent
                    break;
                }
            }

            if (this.verbose) {
                console.log(`🔄 Paths to modify: ${Array.from(this.pathsToModify).join(', ')}`);
                console.log(`➕ Paths to add: ${Array.from(this.pathsToAdd).join(', ')}`);
                console.log(`🗑️ Paths to remove: ${Array.from(this.pathsToRemove).join(', ')}`);
            }
        } catch (error) {
            throw new Error('Error building paths from git diff, giving up on --compare-ref incremental translation');
        }
    }

    /**
     * Extract dot-notation paths from nodes that are on changed lines.
     */
    private extractPathsFromChangedLines(node: ts.Node, addedLines: Set<number>, removedLines: Set<number>, isOldVersion = false): void {
        // Check if this node is on a changed line
        const sourceFile = node.getSourceFile();
        const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

        // Check if any line of this node is in the changed lines
        const nodeLines = Array.from({length: end.line - start.line + 1}, (_, i) => start.line + i + 1);
        const isOnAddedLine = nodeLines.some((lineNumber) => addedLines.has(lineNumber));
        const isOnRemovedLine = nodeLines.some((lineNumber) => removedLines.has(lineNumber));

        // Also check if this node has context annotation changes in its leading comments
        let hasContextChange = false;
        if (this.shouldTranslateNode(node)) {
            // Find the nearest property assignment ancestor (same logic as getContextForNode)
            const nearestPropertyAssignmentAncestor = TSCompilerUtils.findAncestor(node, (n): n is ts.PropertyAssignment => ts.isPropertyAssignment(n));
            if (nearestPropertyAssignmentAncestor) {
                // Get leading comment ranges for this property assignment
                const commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), nearestPropertyAssignmentAncestor.getFullStart()) ?? [];
                for (const range of commentRanges) {
                    const commentStart = sourceFile.getLineAndCharacterOfPosition(range.pos);
                    const commentEnd = sourceFile.getLineAndCharacterOfPosition(range.end);

                    // Check if any line of this comment is in the changed lines
                    const commentLines = Array.from({length: commentEnd.line - commentStart.line + 1}, (_, i) => commentStart.line + i + 1);
                    for (const commentLineNumber of commentLines) {
                        if ((addedLines.has(commentLineNumber) || removedLines.has(commentLineNumber)) && this.lineContainsContextAnnotation(commentLineNumber, sourceFile)) {
                            hasContextChange = true;
                            break;
                        }
                    }
                    if (hasContextChange) {
                        break;
                    }
                }
            }
        }

        const hasChanges = isOnAddedLine || isOnRemovedLine || hasContextChange;
        if (hasChanges && this.shouldTranslateNode(node)) {
            // This node is on a changed line and should be translated
            // Traverse up the tree to build the dot notation path
            const translationsNode = this.findTranslationsNode(node.getSourceFile() ?? this.sourceFile);
            const dotPath = TSCompilerUtils.buildDotNotationPath(node, translationsNode ?? undefined);
            if (dotPath) {
                if (isOldVersion && (isOnRemovedLine || hasContextChange)) {
                    // When traversing old version, removed lines indicate paths to remove
                    this.pathsToRemove.add(dotPath as TranslationPaths);
                } else if (!isOldVersion && (isOnAddedLine || hasContextChange)) {
                    // When traversing current version, added lines indicate paths to modify/add
                    this.pathsToModify.add(dotPath as TranslationPaths);
                }

                if (this.verbose) {
                    console.log(`🔄 Found changed path: ${dotPath} (added: ${isOnAddedLine}, removed: ${isOnRemovedLine}, contextChange: ${hasContextChange})`);
                }
            }
        }

        // Continue traversing children
        node.forEachChild((child) => {
            this.extractPathsFromChangedLines(child, addedLines, removedLines, isOldVersion);
        });
    }

    /**
     * Apply translation to a translatable node, using already-transformed children if available.
     */
    private translateNode(node: ts.Node, translations: Map<number, string>, transformedNode?: ts.Node): ts.Node {
        // Use the transformed node if provided, otherwise use the original
        const nodeToUse = transformedNode ?? node;

        // String literals and no-substitution templates can be translated directly
        if (ts.isStringLiteral(node)) {
            const translatedText = translations.get(this.getTranslationKey(node));
            return translatedText ? ts.factory.createStringLiteral(translatedText) : nodeToUse;
        }

        if (ts.isNoSubstitutionTemplateLiteral(node)) {
            const translatedText = translations.get(this.getTranslationKey(node));
            if (!translatedText) {
                return nodeToUse;
            }

            return ts.factory.createNoSubstitutionTemplateLiteral(translatedText);
        }

        if (ts.isTemplateExpression(node)) {
            const translatedTemplate = translations.get(this.getTranslationKey(node));
            if (!translatedTemplate) {
                console.warn('⚠️ No translation found for template expression', node.getText());
                return nodeToUse;
            }

            // Extract complex expressions from the transformed node (which already has translations applied)
            const translatedComplexExpressions = new Map<number, ts.Expression>();

            // Use the transformed expressions - they'll have nested translations applied for complex expressions
            // and be identical to originals for simple expressions
            const transformedTemplateNode = transformedNode && ts.isTemplateExpression(transformedNode) ? transformedNode : node;
            for (let i = 0; i < node.templateSpans.length; i++) {
                const originalExpression = node.templateSpans[i].expression;
                const transformedExpression = transformedTemplateNode.templateSpans[i].expression;

                if (!this.isSimpleExpression(originalExpression)) {
                    const hash = hashStr(originalExpression.getText());
                    translatedComplexExpressions.set(hash, transformedExpression);
                }
            }

            // Build the translated template expression, referencing the translated template spans as necessary
            return this.stringToTemplateExpression(translatedTemplate, translatedComplexExpressions);
        }

        return nodeToUse;
    }

    /**
     * Extract translated code strings from a transformed AST for the specified paths.
     */
    private extractTranslatedNodes(sourceFile: ts.SourceFile, translatedCodeMap: Map<string, string>): void {
        const visitWithPath = (node: ts.Node, currentPath = '') => {
            // Only extract code strings for exact paths in our sets (not hierarchical matches)
            const isAddedPath = this.pathsToAdd.has(currentPath as TranslationPaths);
            const isModifiedPath = this.pathsToModify.has(currentPath as TranslationPaths);

            if ((isAddedPath || isModifiedPath) && ts.isPropertyAssignment(node)) {
                if (!node.initializer) {
                    throw new Error('Found a dangling property without an initializer in a translation object. This should never happen.');
                }

                // Extract the value (property initializer) as code string
                const codeString = tsPrinter.printNode(ts.EmitHint.Expression, node.initializer, sourceFile);
                translatedCodeMap.set(currentPath, codeString);

                return; // Stop recursing into children
            }

            // Continue traversing children, updating path for property assignments
            node.forEachChild(TSCompilerUtils.createPathAwareVisitor(visitWithPath, currentPath));
        };

        visitWithPath(sourceFile);
    }

    /**
     * Extract removed paths by traversing the old version of en.ts.
     */
    private extractRemovedPaths(removedLines: Set<number>): void {
        try {
            // Get the old version of en.ts from the compare ref
            const relativePath = path.relative(process.cwd(), this.sourceFile.fileName);
            const oldEnContent = Git.show(this.compareRef, relativePath);

            const oldSourceFile = ts.createSourceFile(this.sourceFile.fileName, oldEnContent, ts.ScriptTarget.Latest, true);
            const oldTranslationsNode = this.findTranslationsNode(oldSourceFile);

            // Traverse the old AST to find nodes on removed lines
            this.extractPathsFromChangedLines(oldTranslationsNode, new Set(), removedLines, true);
        } catch (error) {
            if (this.verbose) {
                console.warn('⚠️ Error extracting removed paths:', error);
            }
        }
    }

    /**
     * Create a transformer factory for translating English code into another language.
     * For incremental translations, only translates paths that are in pathsToModify or pathsToAdd.
     */
    private createTranslationTransformer(translations: Map<number, string>): ts.TransformerFactory<ts.SourceFile> {
        return TSCompilerUtils.createPathAwareTransformer((node: ts.Node, currentPath = ''): TransformerResult => {
            if (this.shouldTranslateNode(node) && this.shouldTranslatePath(currentPath)) {
                return {
                    action: TransformerAction.Replace,
                    newNode: (transformedChildNode) => this.translateNode(node, translations, transformedChildNode),
                };
            }
            return {action: TransformerAction.Continue};
        });
    }

    /**
     * Format all dedent() calls in a file to ensure proper indentation.
     * This should be called after Prettier has formatted the file.
     */
    private formatDedentCallsInFile(filePath: string): void {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

        const result = ts.transform(sourceFile, [this.createDedentFormattingTransformer()]);
        const transformedFile = result.transformed.at(0);

        if (transformedFile) {
            const formattedCode = decodeUnicode(tsPrinter.printFile(transformedFile));
            fs.writeFileSync(filePath, formattedCode, 'utf8');
        }

        result.dispose();
    }

    /**
     * Create a transformer that formats dedent() call arguments with proper indentation.
     * This runs after translation to ensure that template strings inside dedent() calls
     * have the correct indentation structure.
     */
    private createDedentFormattingTransformer(): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
            const visit = (node: ts.Node): ts.Node => {
                if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== 'dedent' || !node.arguments[0]) {
                    return ts.visitEachChild(node, visit, context);
                }

                const argument = node.arguments[0];
                const templateIndentation = TSCompilerUtils.getIndentationOfNode(argument, sourceFile);
                const contentIndentation = templateIndentation + 4;

                // isTail = true for complete templates or final fragment before closing backtick
                const formatFragment = (text: string, isTail: boolean) => this.formatDedentTemplateContent(text, contentIndentation, templateIndentation, isTail);

                if (ts.isNoSubstitutionTemplateLiteral(argument)) {
                    return ts.factory.createCallExpression(node.expression, node.typeArguments, [ts.factory.createNoSubstitutionTemplateLiteral(formatFragment(argument.text, true))]);
                }

                if (ts.isTemplateExpression(argument)) {
                    const newHead = ts.factory.createTemplateHead(formatFragment(argument.head.text, false));
                    const newSpans = argument.templateSpans.map((span, i) => {
                        const isTail = i === argument.templateSpans.length - 1;
                        const formattedText = formatFragment(span.literal.text, isTail);
                        const newLiteral = isTail ? ts.factory.createTemplateTail(formattedText) : ts.factory.createTemplateMiddle(formattedText);
                        return ts.factory.createTemplateSpan(span.expression, newLiteral);
                    });

                    return ts.factory.createCallExpression(node.expression, node.typeArguments, [ts.factory.createTemplateExpression(newHead, newSpans)]);
                }

                return node;
            };

            return ts.visitNode(sourceFile, visit) as ts.SourceFile;
        };
    }

    /**
     * Format the content of a template literal inside a dedent() call.
     * Adds proper indentation while preserving relative indentation (e.g., bullet points with extra spaces).
     *
     * @param isTail - True if this is the last fragment before closing backtick (adds trailing newline if needed)
     */
    private formatDedentTemplateContent(text: string, contentIndentation: number, closingIndentation: number, isTail: boolean): string {
        if (!text.includes('\n')) {
            return text;
        }

        const lines = text.split('\n');
        const hasLeadingNewline = text.startsWith('\n');

        // Find minimum indentation (skip first line since it may be on same line as opening backtick)
        let minIndent = Number.MAX_SAFE_INTEGER;
        for (let i = 1; i < lines.length; i++) {
            const line = lines.at(i);
            if (line?.trim()) {
                const indent = line.match(/^ */)?.[0].length ?? 0;
                minIndent = Math.min(minIndent, indent);
            }
        }
        minIndent = minIndent === Number.MAX_SAFE_INTEGER ? 0 : minIndent;

        // Apply base indentation while preserving extra indentation beyond the minimum
        const getIndentedLine = (line: string) => {
            const currentIndent = line.match(/^ */)?.[0].length ?? 0;
            const relativeIndent = currentIndent - minIndent;
            return `${' '.repeat(contentIndentation + relativeIndent)}${line.replace(/^ */, '')}`;
        };

        const formattedLines = lines.map((line, i) => {
            const isFirstLine = i === 0;
            const isLastLine = i === lines.length - 1;

            if (isFirstLine && hasLeadingNewline) {
                return '';
            }
            if (isFirstLine) {
                return line ?? '';
            }
            if (!line?.trim()) {
                return isLastLine && isTail && text.endsWith('\n') ? ' '.repeat(closingIndentation) : '';
            }

            return getIndentedLine(line);
        });

        // Add closing line with proper indentation for pretty formatting
        if (isTail && (text.endsWith(' '.repeat(closingIndentation)) || !text.endsWith('\n'))) {
            if (text.endsWith(' '.repeat(closingIndentation))) {
                formattedLines.pop();
            }

            if (!text.endsWith('\n')) {
                formattedLines.push(' '.repeat(closingIndentation));
            }
        }

        return formattedLines.join('\n');
    }

    /**
     * Create a transformer factory for incremental translations of target files.
     * Injects pathsToAdd and pathsToModify directly into the target file by parsing the code strings for the translated paths.
     * Removes pathsToRemove from the target file.
     * Also cleans up any empty object literals that result from the removals.
     */
    private createIncrementalTargetTransformer(translatedCodeMap: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
        let mainTranslationsNode: ts.ObjectLiteralExpression | undefined;
        return TSCompilerUtils.createPathAwareTransformer((node: ts.Node, currentPath: string): TransformerResult => {
            if (!mainTranslationsNode) {
                mainTranslationsNode = this.findTranslationsNode(node.getSourceFile());
            }

            // Check if this path should be removed
            if (currentPath && this.pathsToRemove.has(currentPath as TranslationPaths)) {
                return {action: TransformerAction.Remove};
            }

            // Check if this is a property assignment that should be modified (exact match only)
            if (ts.isPropertyAssignment(node) && currentPath && translatedCodeMap.has(currentPath)) {
                const translatedCodeString = translatedCodeMap.get(currentPath);
                if (!translatedCodeString) {
                    // This should never happen
                    throw new Error('An unknown error occurred');
                }

                // Parse the code string back to an AST expression
                const translatedExpression = TSCompilerUtils.parseCodeStringToAST(translatedCodeString);
                return {
                    action: TransformerAction.Replace,
                    newNode: () => ts.factory.createPropertyAssignment(node.name, translatedExpression),
                };
            }

            // For object literals, handle additions and cleanup using bottom-up recursion
            if (ts.isObjectLiteralExpression(node)) {
                return {
                    action: TransformerAction.Replace,
                    newNode: (transformedNode) => {
                        if (!ts.isObjectLiteralExpression(transformedNode)) {
                            return transformedNode;
                        }

                        let properties = [...transformedNode.properties];
                        let hasChanges = false;

                        // Remove empty object literals (cleanup after path removals during recursion)
                        properties = properties.filter((prop) => {
                            if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
                                const isEmpty = prop.initializer.properties.length === 0;
                                if (isEmpty) {
                                    hasChanges = true;
                                    if (this.verbose) {
                                        const propName = ts.isIdentifier(prop.name) ? prop.name.text : prop.getText();
                                        console.log(`🧹 Removing empty object after incremental update: "${propName}"`);
                                    }
                                    return false; // Remove empty objects
                                }
                            }
                            return true; // Keep non-object properties and non-empty objects
                        });

                        // Add new properties (if this is the main translations node)
                        if (node === mainTranslationsNode) {
                            // Start with current properties
                            let updatedProperties = [...properties];

                            for (const [addPath, translatedCodeString] of translatedCodeMap) {
                                // Parse the translated code string back to an AST expression
                                const translatedExpression = TSCompilerUtils.parseCodeStringToAST(translatedCodeString);

                                // Inject the value at the correct nested path
                                const currentObject = ts.factory.createObjectLiteralExpression(updatedProperties);
                                const updatedObject = TSCompilerUtils.injectDeepObjectValue(currentObject, addPath, translatedExpression);
                                updatedProperties = [...updatedObject.properties];
                                hasChanges = true;
                            }

                            // Update properties with the final result
                            properties = updatedProperties;
                        }

                        // Only create a new node if something actually changed
                        return hasChanges ? ts.factory.createObjectLiteralExpression(properties) : transformedNode;
                    },
                };
            }

            return {action: TransformerAction.Continue};
        });
    }
}

async function main(): Promise<void> {
    const generator = new TranslationGenerator();
    await generator.generateTranslations();
}

if (require.main === module) {
    main();
}

export default main;
export {GENERATED_FILE_PREFIX};
