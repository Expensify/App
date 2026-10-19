/**
 * Finds `eslint-disable` directives that silence one of the Onyx lint bans in `BANNED_RULES`:
 * `rulesdir/no-onyx-connect`, `rulesdir/no-unsafe-onyx-read`, and the
 * `@typescript-eslint/no-restricted-imports` entry for `react-native-onyx/dist/OnyxUtils`.
 * None of these may be disabled inline. Directives beyond each ban's grandfathered count fail the lint run.
 *
 * A directive counts when it names the ban's rule, or when it is a blanket disable over a banned
 * use: `Onyx.connect` for the connect ban, `Onyx.get()` or `Onyx.multiGet()` for the read ban.
 * For the OnyxUtils ban it counts only when it covers a runtime import of the module. Blanket
 * disables over unrelated code, like the ones around ReportUtils, are ignored. A file Babel cannot
 * parse fails closed: every disable in it counts.
 *
 * Calls and imports are located in the Babel AST, so spacing, comments and parentheses cannot hide
 * them the way they could from a text scan.
 */

import type {ParserPlugin} from '@babel/parser';

import {parse} from '@babel/parser';

import type {ASTNode} from './utils/BabelASTUtils';

import BabelASTUtils from './utils/BabelASTUtils';

/** Rule id of the Onyx.connect() ban, as exposed through eslint-plugin-rulesdir. */
const BANNED_RULE_ID = 'rulesdir/no-onyx-connect';

const BANNED_RULE_NAME = 'no-onyx-connect';

const ONYX_MODULE = 'react-native-onyx';

/**
 * Disables of the ban that already exist on `main`, keyed by repo-relative path with the number of
 * occurrences in each file. Migrating these call sites to useOnyx() is already in progress; any
 * suppressed violation beyond these counts is treated as a new bypass.
 */
const GRANDFATHERED_BYPASSES = new Map<string, number>([
    ['src/libs/NextStepUtils.ts', 1],
    ['src/libs/ReportNameUtils.ts', 2],
]);

type BannedRule = {
    id: string;
    name: string;
    objects: Set<string>;
    methods: Set<string>;
    /** Bans runtime imports of these modules instead of `objects`/`methods` calls. */
    importSources?: Set<string>;
    /** The rule reports on the member access itself (`Onyx.connect`), so an alias or `.call` line is a use too. */
    reportsOnMember?: boolean;
    /**
     * A sibling rule on the same calls (`no-onyx-get-snapshot-key`) reports on the elements of a multi-line
     * `Onyx.multiGet([...])`, so a directive on any of the call's lines silences a report.
     */
    coversInnerLines?: boolean;
    grandfathered: Map<string, number>;
    appliesTo: (file: string) => boolean;
    searchTerms: string[];
    message: string;
};

/** A file ESLint lints, so a directive in it means something. Docs and patches mention directives without honoring them. */
function isLintedFile(file: string): boolean {
    return /\.[cm]?[jt]sx?$/.test(file);
}

// The lint rules run on every linted file; test suites are exempt because reads are allowed there and suites exercise the rules themselves
function isCheckedSourceFile(file: string): boolean {
    return isLintedFile(file) && !file.startsWith('tests/');
}

const ONYX_CONNECT_BAN: BannedRule = {
    id: BANNED_RULE_ID,
    name: BANNED_RULE_NAME,
    objects: new Set(['Onyx']),
    methods: new Set(['connect']),
    reportsOnMember: true,
    grandfathered: GRANDFATHERED_BYPASSES,
    appliesTo: isLintedFile,
    searchTerms: ['Onyx', 'connect', 'eslint-disable'],
    message: 'Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.',
};

const ONYX_READ_BAN: BannedRule = {
    id: 'rulesdir/no-unsafe-onyx-read',
    name: 'no-unsafe-onyx-read',
    objects: new Set(['Onyx']),
    methods: new Set(['get', 'multiGet']),
    coversInnerLines: true,
    grandfathered: new Map<string, number>(),
    appliesTo: isCheckedSourceFile,
    // The import, not `Onyx`, since an aliased import such as `import O from 'react-native-onyx'` is a read site too
    searchTerms: [ONYX_MODULE, 'eslint-disable'],
    message:
        'Onyx reads checked by no-unsafe-onyx-read cannot be silenced with eslint-disable. Fix the read instead: use useOnyx() for data a component renders or reacts to, and call Onyx.get() or Onyx.multiGet() only from event handlers or useCallback bodies in components, pages and hooks.',
};

const ONYX_UTILS_IMPORT_BAN: BannedRule = {
    id: '@typescript-eslint/no-restricted-imports',
    name: '@typescript-eslint/no-restricted-imports',
    objects: new Set(),
    methods: new Set(),
    importSources: new Set(['react-native-onyx/dist/OnyxUtils']),
    grandfathered: new Map<string, number>(),
    appliesTo: isCheckedSourceFile,
    searchTerms: ['OnyxUtils', 'eslint-disable'],
    message:
        'The react-native-onyx/dist/OnyxUtils import restriction cannot be silenced with eslint-disable. Read Onyx with useOnyx(), Onyx.get() or Onyx.multiGet() instead. Type-only imports of OnyxUtils are still allowed.',
};

const BANNED_RULES: BannedRule[] = [ONYX_CONNECT_BAN, ONYX_READ_BAN, ONYX_UTILS_IMPORT_BAN];

/** A banned-rule violation that an inline disable directive silenced. */
type SuppressedBan = {
    file: string;
    line: number;
};

type DirectiveMatch = {
    index: number;
    text: string;
    kind?: string;
    args: string;
};

type BabelComment = {
    type: string;
    value: string;
    start: number | null;
    end: number | null;
};

// A `.ts` file may use angle-bracket assertions, which the jsx plugin would reject
function babelPluginsFor(file: string): ParserPlugin[] {
    return /\.[cm]?ts$/.test(file) ? ['typescript'] : ['typescript', 'jsx'];
}

type ParsedSource = {root: ASTNode; comments: BabelComment[]};

/**
 * Comments found by a plain regex, for a file Babel cannot parse. The regex does not understand strings, so a `/*` in
 * one can hide a later directive; the file already failed to parse, so this is a best effort.
 */
function extractCommentsByRegex(source: string): BabelComment[] {
    return [...source.matchAll(/\/\*(?<block>[\s\S]*?)\*\/|\/\/(?<line>[^\n\r\u2028\u2029]*)/g)].map((match) => ({
        type: match.groups?.block === undefined ? 'CommentLine' : 'CommentBlock',
        value: match.groups?.block ?? match.groups?.line ?? '',
        start: match.index,
        end: match.index + match[0].length,
    }));
}

function parseSource(source: string, file: string): ParsedSource | null {
    try {
        const parsed: unknown = parse(source, {sourceType: 'unambiguous', plugins: babelPluginsFor(file), errorRecovery: true, attachComment: true});
        if (!BabelASTUtils.isASTNode(parsed) || !BabelASTUtils.isRecord(parsed)) {
            return null;
        }
        const rawComments = parsed.comments;
        const comments = Array.isArray(rawComments)
            ? rawComments.filter((comment): comment is BabelComment => {
                  return (
                      BabelASTUtils.isRecord(comment) &&
                      typeof comment.type === 'string' &&
                      typeof comment.value === 'string' &&
                      typeof comment.start === 'number' &&
                      typeof comment.end === 'number'
                  );
              })
            : [];
        return {root: parsed, comments};
    } catch {
        return null;
    }
}

// ESLint only supports -line / -next-line on disable. `eslint-enable-line` and `eslint-enable-next-line` are not real
// directives, so treating them as enables would reopen a blanket disable that ESLint still honors. The keyword must be
// followed by whitespace or the end of the comment, as in ESLint, so `eslint-enable**` is a plain comment too.
const DIRECTIVE_PATTERNS = {
    disable: /^\s*eslint-disable(?<kind>-next-line|-line)?(?=\s|$)(?<args>[\s\S]*)$/,
    enable: /^\s*eslint-enable(?=\s|$)(?<args>[\s\S]*)$/,
};

function collectDirectiveMatches(comments: readonly BabelComment[], source: string, directive: keyof typeof DIRECTIVE_PATTERNS): DirectiveMatch[] {
    const matches: DirectiveMatch[] = [];
    for (const comment of comments) {
        if (comment.start === null || comment.end === null) {
            continue;
        }
        const directiveMatch = comment.value.match(DIRECTIVE_PATTERNS[directive]);
        if (!directiveMatch) {
            continue;
        }
        // ESLint reads only `-line` and `-next-line` directives from a line comment; `// eslint-enable` and a block-form
        // `// eslint-disable` are plain comments to it
        if (comment.type === 'CommentLine' && !directiveMatch.groups?.kind) {
            continue;
        }
        matches.push({index: comment.start, text: source.slice(comment.start, comment.end), kind: directiveMatch.groups?.kind, args: directiveMatch.groups?.args ?? ''});
    }
    return matches;
}

const NON_CHILD_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'comments']);
const WRAPPER_TYPES = new Set(['ParenthesizedExpression', 'TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion']);

function unwrapExpression(node: ASTNode): ASTNode {
    let current = node;
    while (WRAPPER_TYPES.has(current.type) && BabelASTUtils.isASTNode(current.expression)) {
        current = current.expression;
    }
    return current;
}

/** Names bound to the banned object or to one of its banned methods in a file, including aliases. */
type BannedNames = {
    objects: Set<string>;
    methods: Set<string>;
};

function identifierName(node: unknown): string | null {
    return BabelASTUtils.isASTNode(node) && node.type === 'Identifier' && typeof node.name === 'string' ? node.name : null;
}

/** The static name of a property or pattern key: an identifier when not computed, or a string literal either way, like the rules resolve it. */
function staticKeyName(node: unknown, computed: boolean): string | null {
    if (!computed) {
        const name = identifierName(node);
        if (name !== null) {
            return name;
        }
    }
    return BabelASTUtils.isASTNode(node) && node.type === 'StringLiteral' && typeof node.value === 'string' ? node.value : null;
}

function isBannedMember(node: ASTNode, ban: BannedRule, objects: Set<string>): boolean {
    if ((node.type !== 'MemberExpression' && node.type !== 'OptionalMemberExpression') || !BabelASTUtils.isASTNode(node.object)) {
        return false;
    }
    const propertyName = staticKeyName(node.property, node.computed === true);
    const objectName = identifierName(unwrapExpression(node.object));
    return propertyName !== null && ban.methods.has(propertyName) && objectName !== null && objects.has(objectName);
}

/**
 * The lint rules resolve the Onyx import and its aliases (`import O from 'react-native-onyx'`, `const api = Onyx`,
 * `const {get} = Onyx`, `const read = Onyx.get`), so a blanket directive over an aliased call silences them just as
 * well. Collect every such name by walking declarations until no new name appears.
 *
 * This is a name-based superset of what the rules track on purpose: a `let` alias, a parameter that shadows the
 * import, or a bare `Onyx` in a file without the import also count. The rules would not report there, but a blanket
 * directive on such a call is still a bypass worth refusing, and none exists in the repo today.
 */
function collectBannedNames(root: ASTNode, ban: BannedRule): BannedNames {
    const objects = new Set(ban.objects);
    const methods = new Set<string>();
    const sizeBefore = () => objects.size + methods.size;
    const visit = (node: ASTNode) => {
        if (node.type === 'ImportDeclaration' && BabelASTUtils.isASTNode(node.source) && node.source.value === ONYX_MODULE && Array.isArray(node.specifiers)) {
            for (const specifier of node.specifiers) {
                if (BabelASTUtils.isASTNode(specifier) && (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier')) {
                    const localName = identifierName(specifier.local);
                    if (localName !== null) {
                        objects.add(localName);
                    }
                }
            }
        }
        if (node.type === 'VariableDeclarator' && BabelASTUtils.isASTNode(node.id) && BabelASTUtils.isASTNode(node.init)) {
            const init = unwrapExpression(node.init);
            const initName = identifierName(init);
            const idName = identifierName(node.id);
            if (idName !== null && initName !== null && objects.has(initName)) {
                objects.add(idName);
            }
            if (idName !== null && isBannedMember(init, ban, objects)) {
                methods.add(idName);
            }
            if (node.id.type === 'ObjectPattern' && initName !== null && objects.has(initName) && Array.isArray(node.id.properties)) {
                for (const property of node.id.properties) {
                    if (!BabelASTUtils.isASTNode(property) || property.type !== 'ObjectProperty') {
                        continue;
                    }
                    const keyName = staticKeyName(property.key, property.computed === true);
                    const valueName = identifierName(property.value);
                    if (keyName !== null && ban.methods.has(keyName) && valueName !== null) {
                        methods.add(valueName);
                    }
                }
            }
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
            visit(child);
        }
    };
    let size = -1;
    while (size !== sizeBefore()) {
        size = sizeBefore();
        visit(root);
    }
    return {objects, methods};
}

function isBannedCall(node: ASTNode, ban: BannedRule, names: BannedNames): boolean {
    // Optional chaining anywhere in the call (`Onyx?.connect(...)`, `Onyx.connect?.(...)`) produces
    // `OptionalCallExpression`/`OptionalMemberExpression` nodes instead of their non-optional
    // counterparts, so a blanket disable directive over one would otherwise silently bypass the ban.
    if ((node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') || !BabelASTUtils.isASTNode(node.callee)) {
        return false;
    }
    const callee = unwrapExpression(node.callee);
    const calleeName = identifierName(callee);
    if (calleeName !== null) {
        return names.methods.has(calleeName);
    }
    return isBannedMember(callee, ban, names.objects);
}

/** Source range of a banned call or import, so a directive on any of its lines can be matched. */
type BannedRange = {
    start: number;
    end: number;
};

function collectBannedCallRanges(root: ASTNode, ban: BannedRule): BannedRange[] {
    const names = collectBannedNames(root, ban);
    const ranges: BannedRange[] = [];
    const visit = (node: ASTNode) => {
        const isBannedUse = ban.reportsOnMember ? isBannedMember(node, ban, names.objects) : isBannedCall(node, ban, names);
        if (isBannedUse) {
            // Unless a rule reports inside the call, the first line alone silences it
            ranges.push({start: node.start, end: ban.coversInnerLines ? node.end : node.start});
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
            visit(child);
        }
    };
    visit(root);
    return ranges;
}

function isTypeOnlyImport(node: ASTNode): boolean {
    if (node.importKind === 'type' || node.exportKind === 'type') {
        return true;
    }
    const specifiers = node.specifiers;
    return (
        Array.isArray(specifiers) &&
        specifiers.length > 0 &&
        specifiers.every((specifier) => BabelASTUtils.isRecord(specifier) && (specifier.importKind === 'type' || specifier.exportKind === 'type'))
    );
}

function importedSource(node: ASTNode): string | null {
    if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') {
        return BabelASTUtils.isASTNode(node.source) && typeof node.source.value === 'string' ? node.source.value : null;
    }
    if (node.type === 'TSImportEqualsDeclaration' && BabelASTUtils.isASTNode(node.moduleReference) && node.moduleReference.type === 'TSExternalModuleReference') {
        const expression = node.moduleReference.expression;
        return BabelASTUtils.isASTNode(expression) && typeof expression.value === 'string' ? expression.value : null;
    }
    return null;
}

function collectBannedImportRanges(root: ASTNode, sources: Set<string>): BannedRange[] {
    const ranges: BannedRange[] = [];
    const visit = (node: ASTNode) => {
        const source = importedSource(node);
        if (source !== null && sources.has(source) && !isTypeOnlyImport(node)) {
            ranges.push({start: node.start, end: node.start});
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
            visit(child);
        }
    };
    visit(root);
    return ranges;
}

/** ESLint splits a directive from its description only on `--` surrounded by whitespace. */
const DESCRIPTION_SEPARATOR = /\s-{2,}\s/u;

/** The rule list of a directive, with its description and comment decoration removed. */
function directiveRuleList(args: string): string {
    return args.split(DESCRIPTION_SEPARATOR).at(0) ?? '';
}

/** The description after `--`, or an empty string when the directive has none. */
function directiveDescription(args: string): string {
    const match = DESCRIPTION_SEPARATOR.exec(args);
    return match ? args.slice(match.index + match[0].length) : '';
}

function normalizedDirectiveArgs(args: string): string {
    return directiveRuleList(args)
        .replaceAll(/[\s*]+/g, ' ')
        .trim();
}

function directiveTargetsBan(args: string, ban: Pick<BannedRule, 'id' | 'name'>): boolean {
    const trimmed = normalizedDirectiveArgs(args);
    if (trimmed.length === 0) {
        return false;
    }
    return trimmed.split(',').some((part) => {
        // ESLint strips one pair of surrounding quotes from each rule name, so `"rulesdir/x"` means `rulesdir/x`
        const rule = part.trim().replace(/^(['"])(.*)\1$/, '$2');
        return rule === ban.id || rule === ban.name || rule.endsWith(`/${ban.name}`);
    });
}

function isBlanketDirective(args: string): boolean {
    return normalizedDirectiveArgs(args).length === 0;
}

function lineNumberAtOffset(source: string, offset: number): number {
    let line = 1;
    let index = 0;
    const end = Math.min(Math.max(offset, 0), source.length);
    while (index < end) {
        const code = source.charCodeAt(index);
        if (code === 0x0d) {
            line++;
            index += source.charCodeAt(index + 1) === 0x0a ? 2 : 1;
            continue;
        }
        if (code === 0x0a || code === 0x2028 || code === 0x2029) {
            line++;
        }
        index++;
    }
    return line;
}

/**
 * A directive covers a banned call when it reaches any line of the call, not only its first: a rule may report on an
 * element inside a multi-line `Onyx.multiGet([...])`, and a line directive on that element silences it just as well.
 */
function blanketDirectiveCoversCall(source: string, match: DirectiveMatch, bannedRanges: BannedRange[], enableMatches: DirectiveMatch[], ban: BannedRule): boolean {
    const directiveLine = lineNumberAtOffset(source, match.index);
    const kind = match.kind;
    const directiveEnd = match.index + match.text.length;
    const directiveEndLine = lineNumberAtOffset(source, Math.max(match.index, directiveEnd - 1));
    return bannedRanges.some((range) => {
        const firstLine = lineNumberAtOffset(source, range.start);
        const lastLine = lineNumberAtOffset(source, Math.max(range.start, range.end - 1));
        if (kind === '-line') {
            return directiveLine >= firstLine && directiveLine <= lastLine;
        }
        if (kind === '-next-line') {
            return directiveEndLine + 1 >= firstLine && directiveEndLine + 1 <= lastLine;
        }
        if (range.end <= match.index) {
            return false;
        }
        // Only an enable that lands before the call starts frees all of it; one inside the call still leaves lines covered
        const reenabled = enableMatches.some((enableMatch) => {
            const enableOffset = enableMatch.index;
            if (enableOffset <= directiveEnd || enableOffset >= range.start) {
                return false;
            }
            return isBlanketDirective(enableMatch.args) || directiveTargetsBan(enableMatch.args, ban);
        });
        return !reenabled;
    });
}

/**
 * Find disable directives in `source` that suppress `ban`.
 * Line numbers are 1-based. Matches both full-line and trailing `eslint-disable-line`.
 */
function collectDisableDirectivesFromSource(source: string, file: string, ban: BannedRule = ONYX_CONNECT_BAN): SuppressedBan[] {
    const parsed = parseSource(source, file);
    const bans: SuppressedBan[] = [];
    if (!parsed) {
        // Fail closed: with no AST to match uses against, every disable directive counts
        for (const match of collectDirectiveMatches(extractCommentsByRegex(source), source, 'disable')) {
            bans.push({file, line: lineNumberAtOffset(source, match.index)});
        }
        return bans;
    }
    const bannedRanges = ban.importSources ? collectBannedImportRanges(parsed.root, ban.importSources) : collectBannedCallRanges(parsed.root, ban);
    const enableMatches = collectDirectiveMatches(parsed.comments, source, 'enable');
    for (const match of collectDirectiveMatches(parsed.comments, source, 'disable')) {
        const args = match.args;
        const targetsBan = directiveTargetsBan(args, ban);
        const isBlanket = isBlanketDirective(args);
        const coversBan = (isBlanket || (!!ban.importSources && targetsBan)) && blanketDirectiveCoversCall(source, match, bannedRanges, enableMatches, ban);
        if ((ban.importSources || !targetsBan) && !coversBan) {
            continue;
        }
        bans.push({file, line: lineNumberAtOffset(source, match.index)});
    }
    return bans.sort((a, b) => a.line - b.line);
}

/** Return the suppressed bans that exceed the grandfathered allowance for their file. */
function findNewBypasses(suppressedBans: readonly SuppressedBan[], rule: BannedRule = ONYX_CONNECT_BAN): SuppressedBan[] {
    const byFile = new Map<string, SuppressedBan[]>();
    for (const ban of suppressedBans) {
        const list = byFile.get(ban.file) ?? [];
        list.push(ban);
        byFile.set(ban.file, list);
    }

    const newBypasses: SuppressedBan[] = [];
    for (const [file, bans] of byFile) {
        const allowed = rule.grandfathered.get(file) ?? 0;
        if (bans.length <= allowed) {
            continue;
        }
        const sortedByLine = [...bans].sort((a, b) => a.line - b.line);
        newBypasses.push(...sortedByLine.slice(allowed));
    }
    return newBypasses;
}

export {
    BANNED_RULE_ID,
    BANNED_RULES,
    ONYX_READ_BAN,
    ONYX_UTILS_IMPORT_BAN,
    collectDirectiveMatches,
    collectDisableDirectivesFromSource,
    directiveTargetsBan,
    findNewBypasses,
    directiveDescription,
    extractCommentsByRegex,
    isCheckedSourceFile,
    isLintedFile,
    lineNumberAtOffset,
    parseSource,
};
export type {BannedRule};
