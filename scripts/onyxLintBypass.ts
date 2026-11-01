/**
 * Finds `eslint-disable` and `oxlint-disable` directives and `eslint` config comments that silence one of the Onyx lint bans in `BANNED_RULES`:
 * `rulesdir/no-onyx-connect`, `rulesdir/no-unsafe-onyx-read`, and the
 * `no-restricted-imports` entry for `react-native-onyx/dist/OnyxUtils`.
 * None of these may be disabled inline. Directives beyond each ban's grandfathered count fail the lint run.
 *
 * A directive counts when it names the ban's rule, or when it is a blanket disable over a banned
 * use. For the connect ban that use is `Onyx.connect`. For the read ban it is any reference to `Onyx.get` or
 * `Onyx.multiGet`, or the Onyx object itself used as a value (`const api = {...Onyx}`).
 * For the OnyxUtils ban a directive counts only when it covers a runtime import of the module. Blanket
 * disables over unrelated code, like the ones around ReportUtils, are ignored. A file Babel cannot
 * parse fails closed: every disable in it counts.
 *
 * The script finds calls and imports in the Babel AST, so spacing, comments and parentheses that would
 * fool a text scan cannot hide them.
 *
 * A seatbelt TSV row also turns a rule's errors into allowed ones, so the two Onyx read rules in
 * `SEATBELT_FORBIDDEN_RULES` may not have a row there at all.
 */

import type {ParserPlugin} from '@babel/parser';

import {parse} from '@babel/parser';

import type {ASTNode} from './utils/BabelASTUtils';

import BabelASTUtils from './utils/BabelASTUtils';

const BANNED_RULE_ID = 'rulesdir/no-onyx-connect';

const BANNED_RULE_NAME = 'no-onyx-connect';

const ONYX_MODULE = 'react-native-onyx';

/** Inline disables of no-onyx-connect that already existed on `main`, by file path and count. A file with more than its count fails the check. */
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
    /**
     * The rule reports the member access itself as well as a call, so a line that holds `Onyx.connect` or `Onyx.get`
     * as a value (`const read = Onyx.get`, `keys.map(Onyx.get)`, `Onyx.get.call(...)`) or takes it by destructuring
     * (`const {get} = Onyx`) is a use too. Calls, including calls through an alias, count for every ban. no-onyx-connect
     * reports neither alias calls nor destructuring, so counting them for it is part of the name-based superset described
     * at `collectBannedNames`.
     */
    reportsOnMember?: boolean;
    /**
     * The rule reports the banned object itself used as a value (`const api = {...Onyx}`, `fn(Onyx)`, `return Onyx`), so a
     * blanket directive over such a line silences it. The rule allows one value use, the dev console exposure: an assignment
     * to the Onyx property of window or globalThis, cast or not (`(window as X).Onyx = Onyx`). It skips value uses in test
     * infrastructure. In every file it also reports a member whose key it cannot resolve (`Onyx[method]`), since that key
     * may name a read method. A runtime re-export of the object (`export {default as Store} from 'react-native-onyx'`,
     * `export * as Store from ...`) is a value use too.
     */
    reportsOnObjectValue?: boolean;
    /**
     * A directive on an inner line of a multi-line banned call, such as an element line of `Onyx.multiGet([...])`,
     * counts too. The read rule reports a call on its first line, but a directive inside the call is still an
     * attempt to silence the read.
     */
    coversInnerLines?: boolean;
    grandfathered: Map<string, number>;
    appliesTo: (file: string) => boolean;
    searchTerms: string[];
    message: string;
};

/** True for a file oxlint lints. A directive quoted in a markdown doc or a patch file silences nothing, so those files are skipped. */
function isLintedFile(file: string): boolean {
    return /\.[cm]?[jt]sx?$/.test(file);
}

/** True for a linted file outside `tests/`. Test suites may read Onyx, and the rule suites quote banned code as fixtures. */
function isCheckedSourceFile(file: string): boolean {
    return isLintedFile(file) && !file.startsWith('tests/');
}

// An extended regex for git grep -E: oxlint honors `eslint-` and `oxlint-` directives alike, and `eslint` rather than
// `eslint-disable` so that a file whose only directive is an `eslint` config comment is a candidate too
const DIRECTIVE_SEARCH_TERM = 'eslint|oxlint';

// Directories where no-unsafe-onyx-read skips value uses of the Onyx object, such as the `...Onyx` in __mocks__/react-native-onyx.ts.
// Its path check still reports reads in `__mocks__/` and `jest/`, so calls in those files stay checked
const TEST_INFRASTRUCTURE_DIRECTORIES = ['tests/', '__mocks__/', 'jest/'];

function isTestInfrastructureFile(file: string): boolean {
    return TEST_INFRASTRUCTURE_DIRECTORIES.some((directory) => file.startsWith(directory));
}

const ONYX_CONNECT_BAN: BannedRule = {
    id: BANNED_RULE_ID,
    name: BANNED_RULE_NAME,
    objects: new Set(['Onyx']),
    methods: new Set(['connect']),
    reportsOnMember: true,
    grandfathered: GRANDFATHERED_BYPASSES,
    appliesTo: isLintedFile,
    searchTerms: ['Onyx', 'connect', DIRECTIVE_SEARCH_TERM],
    message:
        'An eslint-disable, oxlint-disable or eslint config comment silences rulesdir/no-onyx-connect. Onyx.connect() is deprecated, and its ban allows no new inline exceptions. Remove the comment and read the data with useOnyx().',
};

const ONYX_READ_BAN: BannedRule = {
    id: 'rulesdir/no-unsafe-onyx-read',
    name: 'no-unsafe-onyx-read',
    objects: new Set(['Onyx']),
    methods: new Set(['get', 'multiGet']),
    // The rule reports every reference to Onyx.get or Onyx.multiGet that is not a direct call, so a blanket directive there silences it
    reportsOnMember: true,
    // The rule reports `const api = {...Onyx}` and other value uses of the Onyx object, which hide reads through the copy
    reportsOnObjectValue: true,
    coversInnerLines: true,
    grandfathered: new Map<string, number>(),
    appliesTo: isCheckedSourceFile,
    // The module name rather than `Onyx`, because a file with an aliased import such as `import O from 'react-native-onyx'` can read too
    searchTerms: [ONYX_MODULE, DIRECTIVE_SEARCH_TERM],
    message:
        'An eslint-disable, oxlint-disable or eslint config comment silences rulesdir/no-unsafe-onyx-read. Onyx.get() and Onyx.multiGet() never subscribe, so a read the rule rejects can leave the UI on stale data. Remove the comment and fix the read: use useOnyx() for data a component renders or reacts to, call Onyx.get() or Onyx.multiGet() only from event handlers in components, pages and hooks that render never calls, and use the Onyx object only through its members, never as a value.',
};

const ONYX_UTILS_IMPORT_BAN: BannedRule = {
    // oxlint reports the core rule id; a directive naming the old `@typescript-eslint/` id still counts.
    id: 'no-restricted-imports',
    name: 'no-restricted-imports',
    objects: new Set(),
    methods: new Set(),
    importSources: new Set(['react-native-onyx/dist/OnyxUtils']),
    grandfathered: new Map<string, number>(),
    appliesTo: isCheckedSourceFile,
    searchTerms: ['OnyxUtils', DIRECTIVE_SEARCH_TERM],
    message:
        'An eslint-disable, oxlint-disable or eslint config comment silences the no-restricted-imports ban on react-native-onyx/dist/OnyxUtils. Reads through OnyxUtils skip no-unsafe-onyx-read and no-onyx-get-snapshot-key. Remove the comment and read with useOnyx(), Onyx.get() or Onyx.multiGet(). Type-only imports of OnyxUtils are still allowed.',
};

const BANNED_RULES: BannedRule[] = [ONYX_CONNECT_BAN, ONYX_READ_BAN, ONYX_UTILS_IMPORT_BAN];

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

// Babel's jsx plugin rejects the angle-bracket assertions (`<T>value`) a `.ts` file may use, so `.ts` files parse without it
function babelPluginsFor(file: string): ParserPlugin[] {
    return /\.[cm]?ts$/.test(file) ? ['typescript'] : ['typescript', 'jsx'];
}

type ParsedSource = {root: ASTNode; comments: BabelComment[]};

/**
 * Comments found with a regex, for a file Babel cannot parse. The regex does not skip strings, so a `/*` inside a
 * string can hide a later directive. The check accepts that gap for a file that is already broken.
 */
function extractCommentsByRegex(source: string): BabelComment[] {
    return [...source.matchAll(/\/\*(?<block>[\s\S]*?)\*\/|\/\/(?<line>[^\n\r\u2028\u2029]*)/g)].map((match) => ({
        type: match.groups?.block === undefined ? 'CommentLine' : 'CommentBlock',
        value: match.groups?.block ?? match.groups?.line ?? '',
        start: match.index,
        end: match.index + match[0].length,
    }));
}

/** The Babel AST and comments of `source`, or null when Babel throws or returns something that is not an AST node. */
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

// oxlint reads `eslint-` and `oxlint-` directives alike, and an enable of either prefix reopens a disable of the other.
// It has -line and -next-line forms only for disable: `eslint-enable-line` and `eslint-enable-next-line` are plain
// comments, so reading them as enables would reopen a blanket disable that oxlint still applies. It also needs
// whitespace or the end of the comment after the keyword, so `eslint-enable**` is a plain comment too. oxlint has no
// `eslint` config comments; one is still reported, since it is an attempt to turn the ban off.
const DIRECTIVE_PATTERNS = {
    disable: /^\s*(?:eslint|oxlint)-disable(?<kind>-next-line|-line)?(?=\s|$)(?<args>[\s\S]*)$/,
    enable: /^\s*(?:eslint|oxlint)-enable(?=\s|$)(?<args>[\s\S]*)$/,
    config: /^\s*eslint(?=\s|$)(?<args>[\s\S]*)$/,
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
        // Unlike ESLint, oxlint reads block-form directives from line comments too: `// eslint-disable` silences the rest
        // of the file and `// eslint-enable` reopens it, so both count. A config comment is only ever the block form
        if (directive === 'config' && comment.type === 'CommentLine') {
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

type BannedNames = {
    objects: Set<string>;
    methods: Set<string>;
};

function identifierName(node: unknown): string | null {
    return BabelASTUtils.isASTNode(node) && node.type === 'Identifier' && typeof node.name === 'string' ? node.name : null;
}

/** The static name of a property key (`get`, `'get'` or a plain template literal), or null for a computed key the lint rules cannot resolve either. */
function staticKeyName(node: unknown, computed: boolean): string | null {
    if (!computed) {
        const name = identifierName(node);
        if (name !== null) {
            return name;
        }
    }
    if (!BabelASTUtils.isASTNode(node)) {
        return null;
    }
    if (node.type === 'StringLiteral' && typeof node.value === 'string') {
        return node.value;
    }
    // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
    const quasi: unknown = node.type === 'TemplateLiteral' && Array.isArray(node.expressions) && node.expressions.length === 0 && Array.isArray(node.quasis) ? node.quasis.at(0) : null;
    const cooked: unknown = BabelASTUtils.isRecord(quasi) && BabelASTUtils.isRecord(quasi.value) ? quasi.value.cooked : null;
    return typeof cooked === 'string' ? cooked : null;
}

function isMemberNode(node: ASTNode): boolean {
    return node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression';
}

/** True when `node` names the banned object, `Onyx` or an alias of it. Also true for `Onyx.default` on a namespace import, which the rules resolve to the Onyx object too. */
function isBannedObject(node: unknown, objects: Set<string>): boolean {
    if (!BabelASTUtils.isASTNode(node)) {
        return false;
    }
    const current = unwrapExpression(node);
    const name = identifierName(current);
    if (name !== null) {
        return objects.has(name);
    }
    if (!isMemberNode(current) || staticKeyName(current.property, current.computed === true) !== 'default' || !BabelASTUtils.isASTNode(current.object)) {
        return false;
    }
    const namespaceName = identifierName(unwrapExpression(current.object));
    return namespaceName !== null && objects.has(namespaceName);
}

function isBannedMember(node: ASTNode, ban: BannedRule, objects: Set<string>): boolean {
    if (!isMemberNode(node)) {
        return false;
    }
    const propertyName = staticKeyName(node.property, node.computed === true);
    return propertyName !== null && ban.methods.has(propertyName) && isBannedObject(node.object, objects);
}

/** True for `Onyx[method]`: a member of the banned object whose key no rule can resolve, so it may name a banned method. */
function isDynamicBannedMember(node: ASTNode, objects: Set<string>): boolean {
    return isMemberNode(node) && node.computed === true && staticKeyName(node.property, true) === null && isBannedObject(node.object, objects);
}

/**
 * The names bound to the Onyx object or to a banned method in a file. The lint rules resolve the Onyx import and its
 * aliases (`import O from 'react-native-onyx'`, `const api = Onyx`, `const {get} = Onyx`, `const read = Onyx.get`), so a
 * blanket directive over an aliased call silences them too. The walk repeats over the declarations until no new name appears.
 *
 * Matching by name is a deliberate superset of what the rules track: a `let` alias, a parameter that shadows the
 * import, or a bare `Onyx` in a file without the import also count. The rules would not report those, but a blanket
 * directive over such a call is still a bypass to refuse, and the repo has none today.
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
            const idName = identifierName(node.id);
            if (idName !== null && isBannedObject(init, objects)) {
                objects.add(idName);
            }
            if (idName !== null && isBannedMember(init, ban, objects)) {
                methods.add(idName);
            }
            if (node.id.type === 'ObjectPattern' && isBannedObject(init, objects) && Array.isArray(node.id.properties)) {
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
    // Babel parses optional chaining anywhere in a call (`Onyx?.connect(...)`, `Onyx.connect?.(...)`) as
    // `OptionalCallExpression` and `OptionalMemberExpression` instead of the plain node types. Both are matched,
    // or a blanket disable over an optional call would bypass the ban.
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

type BannedRange = {
    start: number;
    end: number;
};

function bannedDestructuredProperties(node: ASTNode, ban: BannedRule, objects: Set<string>): ASTNode[] {
    if (
        node.type !== 'VariableDeclarator' ||
        !BabelASTUtils.isASTNode(node.id) ||
        node.id.type !== 'ObjectPattern' ||
        !BabelASTUtils.isASTNode(node.init) ||
        !Array.isArray(node.id.properties)
    ) {
        return [];
    }
    if (!isBannedObject(node.init, objects)) {
        return [];
    }
    return node.id.properties.filter((property): property is ASTNode => {
        if (!BabelASTUtils.isASTNode(property) || property.type !== 'ObjectProperty') {
            return false;
        }
        const keyName = staticKeyName(property.key, property.computed === true);
        return keyName !== null && ban.methods.has(keyName);
    });
}

// Keys under which an identifier names a binding or a label instead of reading the value bound to that name
const BINDING_KEYS = new Set(['id', 'params', 'param', 'label', 'imported', 'exported']);

const PATTERN_TYPES = new Set(['ObjectPattern', 'ArrayPattern', 'RestElement']);

const DEV_CONSOLE_GLOBALS = new Set(['window', 'globalThis']);

const DEV_CONSOLE_PROPERTY = 'Onyx';

type AncestorEntry = {node: ASTNode; key: string};

/**
 * True for `window.Onyx = Onyx`, `window['Onyx'] = Onyx` or `globalThis.Onyx = Onyx as typeof Onyx & {...}`, which expose
 * the library to the dev console. Only the Onyx property is exempt, the one react-native-onyx.d.ts declares on Window.
 */
function isDevConsoleExposure(assignment: ASTNode, key: string): boolean {
    if (assignment.type !== 'AssignmentExpression' || key !== 'right' || !BabelASTUtils.isASTNode(assignment.left)) {
        return false;
    }
    const target = assignment.left;
    if (target.type !== 'MemberExpression' || !BabelASTUtils.isASTNode(target.object) || staticKeyName(target.property, target.computed === true) !== DEV_CONSOLE_PROPERTY) {
        return false;
    }
    const globalName = identifierName(unwrapExpression(target.object));
    return globalName !== null && DEV_CONSOLE_GLOBALS.has(globalName);
}

/**
 * True when the identifier at the end of `ancestors` reads the value it names, outside the member-object position the
 * rule allows. Like the rest of this file it goes by name, so a use of a parameter that shadows the import, or of any
 * alias in `objects` such as `api` from `const api = Onyx`, counts too, although the rule reports only the import itself.
 */
function isObjectValueUse(ancestors: readonly AncestorEntry[]): boolean {
    let index = ancestors.length - 1;
    while (index > 0 && ancestors.at(index)?.key === 'expression' && WRAPPER_TYPES.has(ancestors.at(index - 1)?.node.type ?? '')) {
        index--;
    }
    const parent = index > 0 ? ancestors.at(index - 1)?.node : undefined;
    const key = ancestors.at(index)?.key ?? '';
    if (!parent || BINDING_KEYS.has(key) || PATTERN_TYPES.has(parent.type) || (key === 'local' && parent.type.startsWith('Import'))) {
        return false;
    }
    if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') && (key === 'object' || parent.computed !== true)) {
        return false;
    }
    if (key === 'key' && parent.computed !== true) {
        return false;
    }
    // A runtime `typeof Onyx` only inspects the object
    if (parent.type === 'UnaryExpression' && parent.operator === 'typeof') {
        return false;
    }
    // A property value in a destructuring pattern, or the left side of a default or an assignment, is a binding or a
    // write. The rule does report a write such as `Onyx = x`, but that does not typecheck, so it is skipped here
    if ((key === 'value' && ancestors.at(index - 2)?.node.type === 'ObjectPattern') || (key === 'left' && (parent.type === 'AssignmentPattern' || parent.type === 'AssignmentExpression'))) {
        return false;
    }
    // `typeof Onyx` and the other type positions read nothing at runtime. A few TS value positions are skipped too
    // (`import O = Onyx`, an enum initializer, `Onyx<T>`). Of these, only `import O = Onyx` on a namespace import typechecks
    if (parent.type.startsWith('TS') && parent.type !== 'TSExportAssignment') {
        return false;
    }
    return !isDevConsoleExposure(parent, key);
}

/**
 * The nodes the rule reports for a runtime re-export of the Onyx object: each `default` specifier of
 * `export {default as Store} from 'react-native-onyx'`, or the whole `export * as Store from 'react-native-onyx'`, which Babel
 * parses as a named export with a namespace specifier.
 */
function onyxObjectReExportNodes(node: ASTNode): ASTNode[] {
    if (node.type !== 'ExportNamedDeclaration' || importedSource(node) !== ONYX_MODULE || node.exportKind === 'type' || !Array.isArray(node.specifiers)) {
        return [];
    }
    return node.specifiers.flatMap((specifier): ASTNode[] => {
        if (!BabelASTUtils.isASTNode(specifier) || specifier.exportKind === 'type') {
            return [];
        }
        if (specifier.type === 'ExportNamespaceSpecifier') {
            return [node];
        }
        return specifier.type === 'ExportSpecifier' && staticKeyName(specifier.local, false) === 'default' ? [specifier] : [];
    });
}

/** The start offsets of every value use of the banned object, such as `{...Onyx}`, `fn(Onyx)`, `return Onyx` or a re-export. */
function collectObjectValueUseRanges(root: ASTNode, objects: Set<string>): BannedRange[] {
    const ranges: BannedRange[] = [];
    const ancestors: AncestorEntry[] = [];
    const visit = (node: ASTNode, key: string) => {
        ancestors.push({node, key});
        const name = identifierName(node);
        if (name !== null && objects.has(name) && isObjectValueUse(ancestors)) {
            ranges.push({start: node.start, end: node.start});
        }
        for (const reExport of onyxObjectReExportNodes(node)) {
            ranges.push({start: reExport.start, end: reExport.start});
        }
        for (const [childKey, value] of Object.entries(node)) {
            if (NON_CHILD_KEYS.has(childKey)) {
                continue;
            }
            for (const child of Array.isArray(value) ? value : [value]) {
                if (BabelASTUtils.isASTNode(child)) {
                    visit(child, childKey);
                }
            }
        }
        ancestors.pop();
    };
    visit(root, '');
    return ranges;
}

/** The source ranges a blanket disable must not cover: banned calls, plus the member, destructuring and object value uses that the ban's flags say the rule reports. */
function collectBannedCallRanges(root: ASTNode, ban: BannedRule, file: string): BannedRange[] {
    const names = collectBannedNames(root, ban);
    const ranges: BannedRange[] = [];
    const visit = (node: ASTNode) => {
        if (isBannedCall(node, ban, names)) {
            // Unless a rule reports inside the call, the first line alone silences it
            ranges.push({start: node.start, end: ban.coversInnerLines ? node.end : node.start});
        }
        if (ban.reportsOnMember) {
            const memberUses = isBannedMember(node, ban, names.objects) ? [node] : bannedDestructuredProperties(node, ban, names.objects);
            for (const use of memberUses) {
                ranges.push({start: use.start, end: use.start});
            }
        }
        if (ban.reportsOnObjectValue && isDynamicBannedMember(node, names.objects)) {
            ranges.push({start: node.start, end: node.start});
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
            visit(child);
        }
    };
    visit(root);
    if (ban.reportsOnObjectValue && !isTestInfrastructureFile(file)) {
        ranges.push(...collectObjectValueUseRanges(root, names.objects));
    }
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

/**
 * The description starts at the first `--`, bare or spaced, as oxlint reads it: `rulesdir/no-onyx-connect--x` names the ban
 * and `eslint-disable --x` is a blanket disable. ESLint split only on a `--` surrounded by whitespace.
 */
const DESCRIPTION_SEPARATOR = /--/u;

function directiveRuleList(args: string): string {
    return args.split(DESCRIPTION_SEPARATOR).at(0) ?? '';
}

function directiveDescription(args: string): string {
    const match = DESCRIPTION_SEPARATOR.exec(args);
    return match ? args.slice(match.index + match[0].length) : '';
}

/** The rule list of a directive, without its description and with runs of whitespace collapsed. A `*` counts as whitespace, since block comment lines start with one. */
function normalizedDirectiveArgs(args: string): string {
    return directiveRuleList(args)
        .replaceAll(/[\s*]+/g, ' ')
        .trim();
}

/** True when the directive's rule list names `ban`, with or without a plugin prefix such as `rulesdir/`. */
function directiveTargetsBan(args: string, ban: Pick<BannedRule, 'id' | 'name'>): boolean {
    const trimmed = normalizedDirectiveArgs(args);
    if (trimmed.length === 0) {
        return false;
    }
    return trimmed.split(',').some((part) => {
        // oxlint does not strip quotes, so `"rulesdir/x"` silences nothing; it still counts, as an attempt to name the ban
        const rule = part.trim().replace(/^(['"])(.*)\1$/, '$2');
        return rule === ban.id || rule === ban.name || rule.endsWith(`/${ban.name}`);
    });
}

/**
 * True when an `eslint` config comment's rule list mentions `ban.name`, whatever value it sets: `["error", {...}]` can drop
 * the OnyxUtils path from the import restriction, so any value is a bypass. A backslash counts too, because ESLint ran
 * rule names through JSON.parse, which decodes `\u` escapes. oxlint ignores config comments, so this only ever over-reports.
 */
function configDirectiveNamesBan(args: string, ban: Pick<BannedRule, 'name'>): boolean {
    const ruleList = directiveRuleList(args);
    return ruleList.includes(ban.name) || ruleList.includes('\\');
}

function isBlanketDirective(args: string): boolean {
    return normalizedDirectiveArgs(args).length === 0;
}

/** The 1-based line number at `offset`, counting `\r`, U+2028 and U+2029 as line breaks the way ESLint does. */
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
 * True when the directive reaches any line of a banned range. A range spans every line of a call only for a ban with
 * `coversInnerLines`, where a line directive inside a multi-line `Onyx.multiGet([...])` still tries to silence the read.
 * Every other range is the first line of the use. A block disable stops covering a use once a blanket enable, or one that
 * names the ban, comes between them.
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

/** Every directive in `source` that silences `ban`: a disable that names it, a blanket disable over a banned use, or a config comment that names it. Lines are 1-based. */
function collectDisableDirectivesFromSource(source: string, file: string, ban: BannedRule = ONYX_CONNECT_BAN): SuppressedBan[] {
    const parsed = parseSource(source, file);
    const bans: SuppressedBan[] = [];
    if (!parsed) {
        // Fail closed: with no AST to match uses against, every disable directive and config comment counts
        const comments = extractCommentsByRegex(source);
        for (const match of [...collectDirectiveMatches(comments, source, 'disable'), ...collectDirectiveMatches(comments, source, 'config')]) {
            bans.push({file, line: lineNumberAtOffset(source, match.index)});
        }
        return bans;
    }
    const bannedRanges = ban.importSources ? collectBannedImportRanges(parsed.root, ban.importSources) : collectBannedCallRanges(parsed.root, ban, file);
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
    // A config comment names the ban for the whole file, so it covers every use without a range check
    for (const match of collectDirectiveMatches(parsed.comments, source, 'config')) {
        if (configDirectiveNamesBan(match.args, ban) && (!ban.importSources || bannedRanges.length > 0)) {
            bans.push({file, line: lineNumberAtOffset(source, match.index)});
        }
    }
    return bans.sort((a, b) => a.line - b.line);
}

/** The suppressed bans beyond each file's grandfathered count. The earliest lines in a file use up its allowance first. */
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

/**
 * Rules the seatbelt ratchet must never grandfather. `SEATBELT_INCREASE=<rule>` writes a row that turns the rule's
 * errors in that file into allowed ones, which silences the rule as fully as a disable directive.
 * `rulesdir/no-onyx-connect` is not listed, because its existing rows are the backlog still waiting for migration.
 */
const SEATBELT_FORBIDDEN_RULES: readonly string[] = ['rulesdir/no-unsafe-onyx-read', 'rulesdir/no-onyx-get-snapshot-key'];

/** A seatbelt row for a rule the seatbelt may not cover. `file` is as written in the TSV, relative to its directory. */
type ForbiddenSeatbeltRow = {
    file: string;
    rule: string;
    line: number;
};

/** A TSV cell, decoded the way the seatbelt reads it (as JSON), so an escape such as `\u002f` cannot hide a rule id. */
function decodeSeatbeltCell(cell: string): string {
    try {
        const value: unknown = JSON.parse(cell);
        if (typeof value === 'string') {
            return value;
        }
    } catch {
        // Not JSON: fall back to stripping one pair of surrounding quotes
    }
    return cell.trim().replace(/^"(.*)"$/, '$1');
}

function findForbiddenSeatbeltRows(tsvText: string, forbiddenRules: readonly string[]): ForbiddenSeatbeltRow[] {
    const rows: ForbiddenSeatbeltRow[] = [];
    for (const [index, rawLine] of tsvText.split(/\r?\n/).entries()) {
        if (rawLine.trim().length === 0 || /^\s*#/.test(rawLine)) {
            continue;
        }
        const [file = '', rule = ''] = rawLine.split('\t').map(decodeSeatbeltCell);
        if (forbiddenRules.includes(rule)) {
            rows.push({file, rule, line: index + 1});
        }
    }
    return rows;
}

export {
    BANNED_RULE_ID,
    BANNED_RULES,
    DIRECTIVE_SEARCH_TERM,
    ONYX_READ_BAN,
    ONYX_UTILS_IMPORT_BAN,
    SEATBELT_FORBIDDEN_RULES,
    collectDirectiveMatches,
    collectDisableDirectivesFromSource,
    findForbiddenSeatbeltRows,
    configDirectiveNamesBan,
    directiveTargetsBan,
    findNewBypasses,
    directiveDescription,
    extractCommentsByRegex,
    isCheckedSourceFile,
    isLintedFile,
    lineNumberAtOffset,
    parseSource,
};
export type {BannedRule, ForbiddenSeatbeltRow};
