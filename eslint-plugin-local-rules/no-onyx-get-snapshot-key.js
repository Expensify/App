// Node ESM needs the extension to load a rule's helper module
/* eslint-disable import/extensions */
import {
    createOnyxReadTracker,
    getConstInitializer,
    getKeyListElements,
    getOnyxKeyPath,
    getRepoRelativePath,
    getVariableByName,
    matchesCalleeName,
    MULTI_READ_METHOD,
    ONYXKEYS_ROOT,
    READ_METHOD,
    RESTRICTED_KEY_PATHS,
    SNAPSHOT_READ_METHOD,
    TYPE_ONLY_EXPRESSIONS,
} from './utils/onyxReadUtils.js';
/* eslint-enable import/extensions */

const name = 'no-onyx-get-snapshot-key';

// useSnapshotOnyxGet resolves snapshot keys itself, so its own reads skip the key checks
const SNAPSHOT_AWARE_READ_FILES = new Set(['src/hooks/useSnapshotOnyxGet.ts']);

// The Concierge chat is never part of a Search snapshot, so a report key provably built from this ID is always read live
const CONCIERGE_REPORT_ID_KEY_PATH = 'CONCIERGE_REPORT_ID';

const CONCIERGE_CHAT_COLLECTION_KEY_PATH = 'COLLECTION.REPORT';

const ONYX_ID_NORMALIZER_NAMES = new Set(['getNonEmptyStringOnyxID']);

const USE_ONYX_HOOK_NAMES = new Set(['useOnyx', 'useOnyxWithoutSnapshots']);

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow Onyx.get and Onyx.multiGet on Search snapshot keys and on keys the rule cannot resolve, and the useSnapshotOnyxGet() reader on any other key. Disable it only with a reason after `--`.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noRestrictedOnyxKey:
            'Do not read {{keyPath}} with a one-shot Onyx read. src/hooks/useOnyx.ts rewrites this key to snapshot_<hash> inside a SearchScopeProvider subtree, so a component subscribed to it may never have been reading the global key at all. A read here returns live data where the component saw the snapshot, and nothing at the call site can tell the two apart.\n\n' +
            'In an event handler, use useSnapshotOnyxGet() from src/hooks/useSnapshotOnyxGet.ts: call `const getOnyx = useSnapshotOnyxGet();` in the component and `await getOnyx(key)` in the handler. It reads the same snapshot useOnyx would and does not subscribe. Keep useOnyx for values the component renders.\n\n' +
            'If live data is right on purpose (the code replaces useOnyxWithoutSnapshots or Onyx.connect), disable this rule on the line with a reason: `// eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- <why live data is right here>`.',
        noUnresolvableOnyxKey:
            'Do not read Onyx with a key this rule cannot resolve. A key built at runtime cannot be checked against the Search snapshot keys, so a caller can route a snapshot key here without anything failing.\n\n' +
            'Write the key as an ONYXKEYS access, such as ONYXKEYS.SESSION, or as a template literal that starts with an ONYXKEYS collection prefix. For Onyx.multiGet(), pass an array literal, or a const bound to one, whose every element is written that way. If the key cannot be static, disable this rule on the line with a reason after `--`.',
        noNonSnapshotKeyInSnapshotReader:
            'Do not read {{keyPath}} with the useSnapshotOnyxGet() reader. The reader is for Search snapshot keys, which useOnyx may read from snapshot_<hash>, and {{keyPath}} is never read from a snapshot.\n\n' +
            'Use Onyx.get() for it.',
        noUnresolvableSnapshotReaderKey:
            'Do not call the useSnapshotOnyxGet() reader with a key this rule cannot resolve. The reader only accepts Search snapshot keys, and this rule cannot check a key built at runtime.\n\n' +
            'Write the key as an ONYXKEYS access, such as ONYXKEYS.PERSONAL_DETAILS_LIST, or as a template literal that starts with an ONYXKEYS collection prefix, such as ONYXKEYS.COLLECTION.REPORT followed by the report ID.',
        noConciergeChatInSnapshotReader:
            'Do not read the Concierge chat with the useSnapshotOnyxGet() reader. Search snapshots never include it, so inside a SearchScopeProvider the reader returns undefined.\n\n' +
            'Read it with Onyx.get(), which this rule allows for a report key built from ONYXKEYS.CONCIERGE_REPORT_ID.',
    },
};

function findRestrictedKey(keyArgument, scope) {
    const keyPath = getOnyxKeyPath(keyArgument, scope);

    if (!keyPath) {
        return {keyPath: null};
    }

    return RESTRICTED_KEY_PATHS.has(keyPath) ? {keyPath} : null;
}

function findRestrictedKeys(readMethod, call, scope) {
    const keyArgument = call.arguments.at(0);

    if (readMethod !== MULTI_READ_METHOD) {
        const finding = findRestrictedKey(keyArgument, scope);

        return finding ? [{node: call, ...finding}] : [];
    }

    const elements = keyArgument?.type === 'SpreadElement' ? null : getKeyListElements(keyArgument, scope);

    if (!elements) {
        return [{node: call, keyPath: null}];
    }

    return elements.flatMap((element) => {
        if (!element || element.type === 'SpreadElement') {
            return [{node: element ?? call, keyPath: null}];
        }

        const finding = findRestrictedKey(element, scope);

        return finding ? [{node: element, ...finding}] : [];
    });
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const filename = context.filename ?? context.getFilename();
    const {visitors, getCalledReadMethod} = createOnyxReadTracker(sourceCode);

    function isOnyxReadOf(node, keyPath, scope) {
        const call = node?.type === 'AwaitExpression' ? node.argument : node;

        if (call?.type !== 'CallExpression') {
            return false;
        }

        const isOnyxGet = getCalledReadMethod(call.callee, scope) === READ_METHOD;
        const isUseOnyx = matchesCalleeName(call.callee, USE_ONYX_HOOK_NAMES);

        return (isOnyxGet || isUseOnyx) && getOnyxKeyPath(call.arguments.at(0), scope) === keyPath;
    }

    // True when the ID is a const read straight from ONYXKEYS.CONCIERGE_REPORT_ID, by Onyx.get or by a useOnyx tuple
    function isConciergeReportIDExpression(node, scope) {
        let current = node;

        while (current?.type === 'CallExpression' && matchesCalleeName(current.callee, ONYX_ID_NORMALIZER_NAMES)) {
            current = current.arguments.at(0);
        }

        while (current && TYPE_ONLY_EXPRESSIONS.has(current.type)) {
            current = current.expression;
        }

        if (current?.type !== 'Identifier') {
            return false;
        }

        const variable = getVariableByName(scope, current.name);

        if (variable?.defs.length !== 1) {
            return false;
        }

        const definition = variable.defs.at(0);

        if (definition.type !== 'Variable' || definition.parent?.kind !== 'const') {
            return false;
        }

        const {id, init} = definition.node;

        if (id.type === 'Identifier') {
            return isOnyxReadOf(init, CONCIERGE_REPORT_ID_KEY_PATH, scope);
        }

        // const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID)
        const firstElement = id.type === 'ArrayPattern' ? id.elements.at(0) : null;
        return firstElement?.type === 'Identifier' && firstElement.name === current.name && isOnyxReadOf(init, CONCIERGE_REPORT_ID_KEY_PATH, scope);
    }

    // `${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`, directly or through a const
    function isConciergeChatKey(node, scope, seen = new Set()) {
        let current = node;

        while (current && TYPE_ONLY_EXPRESSIONS.has(current.type)) {
            current = current.expression;
        }

        if (current?.type === 'Identifier') {
            if (seen.has(current)) {
                return false;
            }

            seen.add(current);
            const initializer = getConstInitializer(current, scope);
            return !!initializer && isConciergeChatKey(initializer, scope, seen);
        }

        // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
        if (current?.type !== 'TemplateLiteral' || current.expressions.length !== 2 || current.quasis.some((quasi) => quasi.value.cooked !== '')) {
            return false;
        }

        return getOnyxKeyPath(current.expressions.at(0), scope) === CONCIERGE_CHAT_COLLECTION_KEY_PATH && isConciergeReportIDExpression(current.expressions.at(1), scope);
    }

    return {
        ...visitors,
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const readMethod = getCalledReadMethod(node.callee, scope);

            if (!readMethod || SNAPSHOT_AWARE_READ_FILES.has(getRepoRelativePath(filename))) {
                return;
            }

            const keyArgument = node.arguments.at(0);

            if (readMethod === SNAPSHOT_READ_METHOD) {
                if (isConciergeChatKey(keyArgument, scope)) {
                    context.report({node, messageId: 'noConciergeChatInSnapshotReader'});
                    return;
                }

                const keyPath = getOnyxKeyPath(keyArgument, scope);

                if (!keyPath) {
                    context.report({node, messageId: 'noUnresolvableSnapshotReaderKey'});
                } else if (!RESTRICTED_KEY_PATHS.has(keyPath)) {
                    context.report({node, messageId: 'noNonSnapshotKeyInSnapshotReader', data: {keyPath: `${ONYXKEYS_ROOT}.${keyPath}`}});
                }
                return;
            }

            if (readMethod === READ_METHOD && isConciergeChatKey(keyArgument, scope)) {
                return;
            }

            for (const finding of findRestrictedKeys(readMethod, node, scope)) {
                context.report(
                    finding.keyPath
                        ? {node: finding.node, messageId: 'noRestrictedOnyxKey', data: {keyPath: `${ONYXKEYS_ROOT}.${finding.keyPath}`}}
                        : {node: finding.node, messageId: 'noUnresolvableOnyxKey'},
                );
            }
        },
    };
}

export {name, meta, create};
