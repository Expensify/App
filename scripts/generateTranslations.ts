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
import {isTranslationTargetLocale, LOCALES, TRANSLATION_TARGET_LOCALES} from '@src/CONST/LOCALES';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import en from '@src/languages/en';
import type {TranslationPaths} from '@src/languages/types';
import CLI from './utils/CLI';
import Git from './utils/Git';
import Prettier from './utils/Prettier';
import PromisePool from './utils/PromisePool';
import ChatGPTTranslator from './utils/Translator/ChatGPTTranslator';
import DummyTranslator from './utils/Translator/DummyTranslator';
import type Translator from './utils/Translator/Translator';
import TSCompilerUtils from './utils/TSCompilerUtils';

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
     * If a complex template expression comes from an existing translation file rather than ChatGPT, then the hashes of its spans will be serialized from the translated version of those spans.
     * This map provides us a way to look up the English hash for each translated span hash, so that when we're transforming the English file and we encounter a translated expression hash,
     * we can look up English hash and use it to look up the translation for that hash (since the translation map is keyed by English string hashes).
     */
    private readonly translatedSpanHashToEnglishSpanHash = new Map<number, number>();

    constructor(config: {
        targetLanguages: TranslationTargetLocale[];
        languagesDir: string;
        sourceFile: string;
        translator: Translator;
        compareRef: string;
        paths?: Set<TranslationPaths>;
        verbose: boolean;
    }) {
        this.targetLanguages = config.targetLanguages;
        this.languagesDir = config.languagesDir;
        const sourceCode = fs.readFileSync(config.sourceFile, 'utf8');
        this.sourceFile = ts.createSourceFile(config.sourceFile, sourceCode, ts.ScriptTarget.Latest, true);
        this.translator = config.translator;
        this.compareRef = config.compareRef;
        this.pathsToAdd = new Set<TranslationPaths>();
        this.pathsToModify = config.paths ?? new Set<TranslationPaths>();
        this.pathsToRemove = new Set<TranslationPaths>();
        this.verbose = config.verbose;
        this.isIncremental = this.pathsToModify.size > 0 || !!this.compareRef;
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

        for (const targetLanguage of this.targetLanguages) {
            // Map of translations
            const translationsForLocale = translations.get(targetLanguage) ?? new Map<number, string>();

            // Extract strings to translate
            const stringsToTranslate = new Map<number, StringWithContext>();
            this.extractStringsToTranslate(this.sourceFile, stringsToTranslate);

            // Translate all the strings in parallel (up to 8 at a time)
            const translationPromises = [];
            for (const [key, {text, context}] of stringsToTranslate) {
                if (translationsForLocale.has(key)) {
                    // This means that the translation for this key was already parsed from an existing translation file, so we don't need to translate it with ChatGPT
                    continue;
                }
                const translationPromise = promisePool.add(() => this.translator.translate(targetLanguage, text, context).then((result) => translationsForLocale.set(key, result)));
                translationPromises.push(translationPromise);
            }
            await Promise.allSettled(translationPromises);

            // Replace translated strings in the AST
            let transformedSourceFile: ts.SourceFile;

            if (this.isIncremental) {
                // Parse the existing target file
                const targetPath = path.join(this.languagesDir, `${targetLanguage}.ts`);

                if (!fs.existsSync(targetPath)) {
                    throw new Error(`Target file ${targetPath} does not exist for incremental translation`);
                }

                // Transform en.ts with path filtering for pathsToModify and pathsToAdd.
                // The result is a "patch" of the main translations node, including only the paths that are added or modified,
                // where the values are translated to the target language.
                const enResult = ts.transform(this.sourceFile, [this.createIncrementalEnTransformer(translationsForLocale)]);
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
                const cleanupTransformer = this.createEmptyObjectCleanupTransformer();
                const targetResult = ts.transform(existingSourceFile, [targetTransformer, cleanupTransformer]);
                const transformedTargetResult = targetResult.transformed.at(0);
                if (!transformedTargetResult) {
                    throw new Error('Failed to transform target file');
                }
                transformedSourceFile = transformedTargetResult;
                targetResult.dispose();
            } else {
                // Full transformation for non-incremental mode - transform en.ts
                const transformer = this.createFullTransformer(translationsForLocale);
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
        if (this.pathsToModify.size === 0 && this.pathsToAdd.size === 0) {
            return true;
        }

        // Check if path is in either pathsToModify or pathsToAdd
        const allPathsToTranslate = new Set([...this.pathsToModify, ...this.pathsToAdd]);
        for (const targetPath of allPathsToTranslate) {
            if (currentPath === targetPath || currentPath.startsWith(`${targetPath}.`)) {
                return true;
            }
        }

        return false;
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
    private extractStringsToTranslate(node: ts.Node, stringsToTranslate: Map<number, StringWithContext>, currentPath = '') {
        if (this.shouldTranslateNode(node)) {
            // Check if this translation path should be included based on the paths filter
            if (!this.shouldTranslatePath(currentPath)) {
                return; // Skip this node and its children if the path doesn't match
            }

            const context = this.getContextForNode(node);
            const translationKey = this.getTranslationKey(node);

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
                    node.templateSpans.forEach((span) => this.extractStringsToTranslate(span, stringsToTranslate, currentPath));
                    stringsToTranslate.set(translationKey, {text: this.templateExpressionToString(node), context});
                }
            }
        }

        // Continue traversing children
        node.forEachChild((child) => {
            let childPath = currentPath;

            // If the child is a property assignment, update the path
            if (ts.isPropertyAssignment(child)) {
                let propName: string | undefined;

                if (ts.isIdentifier(child.name)) {
                    propName = child.name.text;
                } else if (ts.isStringLiteral(child.name)) {
                    propName = child.name.text;
                }

                if (propName) {
                    childPath = currentPath ? `${currentPath}.${propName}` : propName;
                }
            }

            this.extractStringsToTranslate(child, stringsToTranslate, childPath);
        });
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
                console.log(`🔍 Found ${changedLines.addedLines.size} added lines, ${changedLines.removedLines.size} removed lines`);
            }

            // Traverse current en.ts for added and modified paths
            this.extractPathsFromChangedLines(translationsNode, changedLines.addedLines, new Set());

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
                    for (const pathToCheck of this.pathsToModify) {
                        if (!this.pathExistsInFile(existingSourceFile, pathToCheck)) {
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
            if (this.verbose) {
                console.warn('⚠️ Error building paths from git diff, falling back to full translation:', error);
            }
            // On error, don't populate any paths (will fall back to full translation)
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

        if ((isOnAddedLine || isOnRemovedLine) && this.shouldTranslateNode(node)) {
            // This node is on a changed line and should be translated
            // Traverse up the tree to build the dot notation path
            const translationsNode = this.findTranslationsNode(node.getSourceFile() ?? this.sourceFile);
            const dotPath = TSCompilerUtils.buildDotNotationPath(node, translationsNode ?? undefined);
            if (dotPath) {
                if (isOldVersion && isOnRemovedLine) {
                    // When traversing old version, removed lines indicate paths to remove
                    this.pathsToRemove.add(dotPath as TranslationPaths);
                } else if (!isOldVersion && isOnAddedLine) {
                    // When traversing current version, added lines indicate paths to modify/add
                    this.pathsToModify.add(dotPath as TranslationPaths);
                }

                if (this.verbose) {
                    console.log(`🔄 Found changed path: ${dotPath} (added: ${isOnAddedLine}, removed: ${isOnRemovedLine})`);
                }
            }
        }

        // Continue traversing children
        node.forEachChild((child) => {
            this.extractPathsFromChangedLines(child, addedLines, removedLines, isOldVersion);
        });
    }

    /**
     * Check if a dot-notation path exists in the given source file.
     */
    private pathExistsInFile(sourceFile: ts.SourceFile, dotNotationPath: string): boolean {
        const translationsNode = this.findTranslationsNode(sourceFile);

        const pathParts = dotNotationPath.split('.');
        let currentNode: ts.ObjectLiteralExpression = translationsNode;

        // Traverse the path parts to see if the full path exists
        for (const pathPart of pathParts) {
            let found = false;

            for (const property of currentNode.properties) {
                if (ts.isPropertyAssignment(property)) {
                    const propertyKey = TSCompilerUtils.extractKeyFromPropertyNode(property);
                    if (propertyKey === pathPart) {
                        // Found this path part
                        if (pathPart === pathParts.at(-1)) {
                            // This is the final path part - we found the complete path
                            return true;
                        }

                        // Continue traversing - check if the next level is an object
                        if (ts.isObjectLiteralExpression(property.initializer)) {
                            currentNode = property.initializer;
                            found = true;
                            break;
                        } else {
                            // Next level is not an object, so path doesn't exist
                            return false;
                        }
                    }
                }
            }

            if (!found) {
                // Didn't find this path part
                return false;
            }
        }

        return false; // Shouldn't reach here, but just in case
    }

    /**
     * Apply translation to a translatable node.
     */
    private translateNode(node: ts.Node, translations: Map<number, string>, currentPath: string, visitWithPath: (node: ts.Node, path: string) => ts.Node | undefined): ts.Node | undefined {
        // String literals and no-substitution templates can be translated directly
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
            for (const span of node.templateSpans) {
                const expression = span.expression;
                if (this.isSimpleExpression(expression)) {
                    continue;
                }
                // Template expression is complex
                const hash = hashStr(expression.getText());
                const translatedExpression = visitWithPath(expression, currentPath);
                translatedComplexExpressions.set(hash, translatedExpression as ts.Expression);
            }

            // Build the translated template expression, referencing the translated template spans as necessary
            return this.stringToTemplateExpression(translatedTemplate, translatedComplexExpressions);
        }

        return node;
    }

    /**
     * Extract translated code strings from a transformed AST for the specified paths.
     */
    private extractTranslatedNodes(sourceFile: ts.SourceFile, translatedCodeMap: Map<string, string>): void {
        const visitWithPath = (node: ts.Node, currentPath = ''): void => {
            // Only extract code strings for exact paths in our sets (not hierarchical matches)
            const isAddedPath = this.pathsToAdd.has(currentPath as TranslationPaths);
            const isModifiedPath = this.pathsToModify.has(currentPath as TranslationPaths);

            if (isAddedPath || isModifiedPath) {
                if (isAddedPath) {
                    // For pathsToAdd: extract the entire PropertyAssignment as code string
                    const codeString = tsPrinter.printNode(ts.EmitHint.Unspecified, node, sourceFile);
                    translatedCodeMap.set(currentPath, codeString);
                } else if (isModifiedPath && ts.isPropertyAssignment(node)) {
                    // For pathsToModify: extract only the value (initializer) as code string
                    if (node.initializer) {
                        const codeString = tsPrinter.printNode(ts.EmitHint.Expression, node.initializer, sourceFile);
                        translatedCodeMap.set(currentPath, codeString);
                    }
                }
                return; // Stop recursing into children
            }

            // Continue traversing children, updating path for property assignments
            node.forEachChild((child) => {
                let childPath = currentPath;

                // If the child is a property assignment, update the path
                if (ts.isPropertyAssignment(child)) {
                    const propName = TSCompilerUtils.extractKeyFromPropertyNode(child);
                    if (propName) {
                        childPath = currentPath ? `${currentPath}.${propName}` : propName;
                    }
                }

                visitWithPath(child, childPath);
            });
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
     * Continue traversing children, updating path for property assignments.
     */
    private visitChildren(node: ts.Node, currentPath: string, visitWithPath: (node: ts.Node, path: string) => ts.Node | undefined, context: ts.TransformationContext): ts.Node {
        return ts.visitEachChild(
            node,
            (child) => {
                let childPath = currentPath;

                // If the child is a property assignment, update the path
                if (ts.isPropertyAssignment(child)) {
                    const propName = TSCompilerUtils.extractKeyFromPropertyNode(child);
                    if (propName) {
                        childPath = currentPath ? `${currentPath}.${propName}` : propName;
                    }
                }

                return visitWithPath(child, childPath);
            },
            context,
        );
    }

    /**
     * Create a transformer factory for full translations (transforms en.ts completely).
     */
    private createFullTransformer(translations: Map<number, string>): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            const visitWithPath = (node: ts.Node, currentPath = ''): ts.Node | undefined => {
                if (this.shouldTranslateNode(node)) {
                    return this.translateNode(node, translations, currentPath, visitWithPath);
                }

                return this.visitChildren(node, currentPath, visitWithPath, context);
            };

            return (sourceFile: ts.SourceFile) => {
                return (ts.visitNode(sourceFile, visitWithPath) as ts.SourceFile) ?? sourceFile;
            };
        };
    }

    /**
     * Create a transformer factory for incremental translations of target files.
     * Handles pathsToModify (retranslate) and pathsToRemove (delete).
     */
    /**
     * Create a transformer factory for translating en.ts with path filtering.
     * Only translates paths that are in pathsToModify or pathsToAdd.
     */
    private createIncrementalEnTransformer(translations: Map<number, string>): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            const visitWithPath = (node: ts.Node, currentPath = ''): ts.Node | undefined => {
                if (this.shouldTranslateNode(node)) {
                    // Use shouldTranslatePath to handle hierarchical path matching
                    if (this.shouldTranslatePath(currentPath)) {
                        return this.translateNode(node, translations, currentPath, visitWithPath);
                    }
                    return node; // Keep unchanged
                }

                return this.visitChildren(node, currentPath, visitWithPath, context);
            };

            return (sourceFile: ts.SourceFile) => {
                return (ts.visitNode(sourceFile, visitWithPath) as ts.SourceFile) ?? sourceFile;
            };
        };
    }

    /**
     * Create a transformer factory for incremental translations of target files.
     * Handles pathsToModify (replace) and pathsToRemove (delete) using translated code strings.
     */
    private createIncrementalTargetTransformer(translatedCodeMap: Map<string, string>): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            const visitWithPath = (node: ts.Node, currentPath = ''): ts.Node | undefined => {
                // Check if this path should be removed
                if (currentPath && this.pathsToRemove.has(currentPath as TranslationPaths)) {
                    return undefined; // Remove this node
                }

                // Check if this is a property assignment that should be modified (exact match only)
                if (ts.isPropertyAssignment(node) && currentPath && translatedCodeMap.has(currentPath)) {
                    const translatedCodeString = translatedCodeMap.get(currentPath);

                    // Parse the code string back to an AST expression
                    const tempSourceFile = ts.createSourceFile('temp.ts', `const temp = ${translatedCodeString};`, ts.ScriptTarget.Latest);
                    const tempStatement = tempSourceFile.statements.at(0);
                    if (!tempStatement || !ts.isVariableStatement(tempStatement)) {
                        throw new Error(`'Malformed code string ${tempStatement?.getText()}'`);
                    }
                    const translatedExpression = tempStatement.declarationList.declarations[0].initializer;
                    if (translatedExpression) {
                        return ts.factory.createPropertyAssignment(node.name, translatedExpression);
                    }
                }

                // Check if this is the main translations node and we need to add new properties
                if (ts.isObjectLiteralExpression(node)) {
                    const sourceFile = node.getSourceFile();
                    const mainTranslationsNode = this.findTranslationsNode(sourceFile);

                    if (node === mainTranslationsNode) {
                        const newProperties = [...node.properties];
                        let hasAdditions = false;

                        // Add properties for pathsToAdd
                        for (const [addPath, translatedCodeString] of translatedCodeMap) {
                            if (this.pathsToAdd.has(addPath as TranslationPaths)) {
                                const pathParts = addPath.split('.');

                                // For top-level additions
                                if (pathParts.length === 1 && currentPath === '') {
                                    // Parse the code string back to a PropertyAssignment
                                    const tempSourceFile = ts.createSourceFile('temp.ts', `const temp = { ${translatedCodeString} };`, ts.ScriptTarget.Latest);
                                    const tempStatement = tempSourceFile.statements[0] as ts.VariableStatement;
                                    const tempObject = tempStatement.declarationList.declarations[0].initializer as ts.ObjectLiteralExpression;
                                    const propertyAssignment = tempObject.properties[0];
                                    if (ts.isPropertyAssignment(propertyAssignment)) {
                                        newProperties.push(propertyAssignment);
                                        hasAdditions = true;
                                    }
                                }
                            }
                        }

                        if (hasAdditions) {
                            return ts.factory.createObjectLiteralExpression(newProperties);
                        }
                    }
                }

                return this.visitChildren(node, currentPath, visitWithPath, context);
            };

            return (sourceFile: ts.SourceFile) => {
                return (ts.visitNode(sourceFile, visitWithPath) as ts.SourceFile) ?? sourceFile;
            };
        };
    }

    /**
     * Create a transformer factory for cleaning up empty objects in target files.
     * Removes property assignments that have empty object literals as their initializer.
     */
    private createEmptyObjectCleanupTransformer(): ts.TransformerFactory<ts.SourceFile> {
        return (context: ts.TransformationContext) => {
            return (sourceFile: ts.SourceFile) => {
                // Find the main translations node from the current source file
                const mainTranslationsNode = this.findTranslationsNode(sourceFile);

                const visitWithPath = (node: ts.Node, currentPath = ''): ts.Node | undefined => {
                    // Check if we're in the main translation node
                    if (ts.isObjectLiteralExpression(node) && node === mainTranslationsNode) {
                        // Filter out properties that have empty object literals as initializers
                        const filteredProperties = node.properties.filter((prop) => {
                            if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
                                const isEmpty = prop.initializer.properties.length === 0;
                                if (isEmpty && this.verbose) {
                                    const propName = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.getText();
                                    console.log(`🧹 [CleanupTransformer] Removing empty object: "${propName}"`);
                                }
                                return !isEmpty; // Keep only non-empty objects
                            }
                            return true; // Keep all other properties
                        });

                        if (filteredProperties.length !== node.properties.length) {
                            return ts.factory.createObjectLiteralExpression(filteredProperties);
                        }
                    }

                    return this.visitChildren(node, currentPath, visitWithPath, context);
                };

                return (ts.visitNode(sourceFile, visitWithPath) as ts.SourceFile) ?? sourceFile;
            };
        };
    }
}

/**
 * The main function mostly contains CLI and file I/O logic, while TS parsing and translation logic is encapsulated in TranslationGenerator.
 */
async function main(): Promise<void> {
    const languagesDir = process.env.LANGUAGES_DIR ?? path.join(__dirname, '../src/languages');
    const enSourceFile = path.join(languagesDir, 'en.ts');

    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        flags: {
            'dry-run': {
                description: 'If true, just do local mocked translations rather than making real requests to an AI translator.',
            },
            verbose: {
                description: 'Should we print verbose logs?',
            },
        },
        namedArgs: {
            // By default, generate translations for all supported languages. Can be overridden with the --locales flag
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
                        return val; // Empty string is valid (means no comparison)
                    }

                    // Validate that the ref exists using our Git utility
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

    const generator = new TranslationGenerator({
        targetLanguages: cli.namedArgs.locales,
        languagesDir,
        sourceFile: enSourceFile,
        translator,
        compareRef: cli.namedArgs['compare-ref'],
        paths: cli.namedArgs.paths,
        verbose: cli.flags.verbose,
    });

    await generator.generateTranslations();
}

if (require.main === module) {
    main();
}

export default main;
export {GENERATED_FILE_PREFIX};
