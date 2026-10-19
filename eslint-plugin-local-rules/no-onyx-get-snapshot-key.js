import fs from 'fs';
import path from 'path';

/* eslint-disable import/extensions */
// Node ESM needs the extension to load a rule's helper module
import {
    createOnyxReadTracker,
    getConstInitializer,
    getKeyListElements,
    getOnyxKeyPath,
    getSingleVariableDefinition,
    getStaticName,
    MULTI_READ_METHOD,
    ONYX_MODULE,
    ONYXKEYS_ROOT,
    READ_METHOD,
    REPO_ROOT,
    resolveVariable,
    SNAPSHOT_KEYS_SOURCE,
    unwrapTypeOnlyExpressions,
} from './utils/onyxReadUtils.js';
/* eslint-enable import/extensions */

const name = 'no-onyx-get-snapshot-key';

const SNAPSHOT_KEYS_DECLARATION = /SEARCH_SNAPSHOT_ONYX_KEYS:\s*\[([^\]]*)\]/;

// A read of the Concierge chat always wants the live report, so a report key provably built from this ID may read live data
const CONCIERGE_REPORT_ID_KEY_PATH = 'CONCIERGE_REPORT_ID';

const REPORT_COLLECTION_KEY_PATH = 'COLLECTION.REPORT';

const USE_ONYX_HOOK_SOURCE = /(^|\/)useOnyx$/;

const USE_ONYX_EXPORT_NAME = 'useOnyx';

const SELECTOR_OPTION_NAME = 'selector';

// Read once at load. ESLint's result cache is keyed on the linted file and the config, not on this list, so after
// SEARCH_SNAPSHOT_ONYX_KEYS changes a cached pass survives until that file or the config changes; lint with --no-cache then.
function resolveRestrictedKeyPaths() {
    if (!REPO_ROOT) {
        throw new Error(`${name} could not locate ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`);
    }

    const source = fs.readFileSync(path.join(REPO_ROOT, SNAPSHOT_KEYS_SOURCE), 'utf8');
    const declaration = SNAPSHOT_KEYS_DECLARATION.exec(source);

    if (!declaration) {
        throw new Error(`${name} could not read SEARCH_SNAPSHOT_ONYX_KEYS from ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`);
    }

    return new Set([...declaration[1].matchAll(/ONYXKEYS\.([A-Z0-9_.]+)/g)].map((match) => match[1]));
}

const RESTRICTED_KEY_PATHS = resolveRestrictedKeyPaths();

const DISABLE_GUIDANCE =
    'Live data is right only when the read replaces a subscription that never went through the useOnyx() redirection, such as a module-level Onyx.connect() used from handlers only. ' +
    'Then disable this rule on the line with a reason after `--`, for example: `// eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- replaces a module-level Onyx.connect used only by handlers, never read a snapshot`.';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow Onyx.get and Onyx.multiGet on Search snapshot keys and on keys the rule cannot resolve. Disable it only with a reason after `--`.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noRestrictedOnyxKey: [
            'Do not read {{keyPath}} with a one-shot Onyx read. src/hooks/useOnyx.ts rewrites this key to snapshot_<hash> inside a SearchScopeProvider subtree, so a component subscribed to it may never have been reading the global key at all. A read here returns live data where the component saw the snapshot, and nothing at the call site can tell the two apart.',
            'Take the value as a parameter from the component, which knows whether it is inside a Search scope, or keep the useOnyx subscription. A read of the Concierge chat always wants the live report, so a report key built from a const read of ONYXKEYS.CONCIERGE_REPORT_ID in this file is allowed.',
            DISABLE_GUIDANCE,
        ].join('\n\n'),
        noUnresolvableOnyxKey: [
            'Do not read Onyx with a key this rule cannot resolve. The read surface is restricted to keys that are provably not Search snapshot keys, and a key built at runtime cannot be checked, so a caller can route a snapshot key here without anything failing.',
            'Write the key as an ONYXKEYS access, such as ONYXKEYS.SESSION, or as a template literal that starts with an ONYXKEYS collection prefix. For Onyx.multiGet(), pass an array literal, or a const bound to one, whose every element is written that way. If the key cannot be static, keep the useOnyx subscription or take the value as a parameter.',
            DISABLE_GUIDANCE,
        ].join('\n\n'),
    },
};

// `(await Onyx.get(key)) as string` and `await (Onyx.get(key) as Promise<string>)` both resolve to the call
function unwrapAwaitAndTypeOnlyExpressions(node) {
    let current = unwrapTypeOnlyExpressions(node);

    while (current?.type === 'AwaitExpression') {
        current = unwrapTypeOnlyExpressions(current.argument);
    }

    return current;
}

// Index of `variableName` in `const [a, b = ''] = ...`. A default must be a literal, so a missing ID cannot fall back to another report
function getBoundElementIndex(arrayPattern, variableName) {
    return arrayPattern.elements.findIndex((element) => {
        if (element?.type === 'AssignmentPattern') {
            return element.left.type === 'Identifier' && element.left.name === variableName && element.right.type === 'Literal';
        }

        return element?.type === 'Identifier' && element.name === variableName;
    });
}

function hasSelectorOption(call) {
    const options = call.arguments.at(1);

    if (!options) {
        return false;
    }

    // Anything but a plain object literal could carry a selector, which replaces the tuple value with something else
    return (
        options.type !== 'ObjectExpression' || options.properties.some((property) => property.type !== 'Property' || getStaticName(property.key, property.computed) === SELECTOR_OPTION_NAME)
    );
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const {getCalledReadMethod, getImportSpecifier} = createOnyxReadTracker(sourceCode);

    function isMultiReadCall(call) {
        return getCalledReadMethod(call.callee) === MULTI_READ_METHOD;
    }

    // `import useOnyx from '@hooks/useOnyx'` or `import {useOnyx as x} from 'react-native-onyx'`
    function isUseOnyxCall(call) {
        if (call.callee.type !== 'Identifier') {
            return false;
        }

        const hookModuleSpecifier = getImportSpecifier(call.callee, (source) => USE_ONYX_HOOK_SOURCE.test(source));

        if (hookModuleSpecifier) {
            return hookModuleSpecifier.type === 'ImportDefaultSpecifier';
        }

        const onyxSpecifier = getImportSpecifier(call.callee, (source) => source === ONYX_MODULE);

        return onyxSpecifier?.type === 'ImportSpecifier' && getStaticName(onyxSpecifier.imported, false) === USE_ONYX_EXPORT_NAME;
    }

    // ONYXKEYS.X, directly or through a const. Unlike getOnyxKeyPath it never accepts a template literal, whose leading
    // ONYXKEYS prefix would otherwise count as the whole key
    function getMemberKeyPath(node, seen = new Set()) {
        const current = unwrapTypeOnlyExpressions(node);

        if (current?.type === 'Identifier' && current.name !== ONYXKEYS_ROOT) {
            if (seen.has(current)) {
                return null;
            }

            seen.add(current);
            const initializer = getConstInitializer(current, sourceCode);

            return initializer ? getMemberKeyPath(initializer, seen) : null;
        }

        return current?.type === 'MemberExpression' ? getOnyxKeyPath(current, sourceCode) : null;
    }

    // The proof follows const aliases only, since a `let` alias of Onyx.get could be reassigned before the read
    function readsConciergeReportID(call) {
        return (
            call?.type === 'CallExpression' && getCalledReadMethod(call.callee, {constOnly: true}) === READ_METHOD && getMemberKeyPath(call.arguments.at(0)) === CONCIERGE_REPORT_ID_KEY_PATH
        );
    }

    // Slot `elementIndex` of a `const [...] = useOnyx(...)` tuple or an awaited Onyx.multiGet() result
    function tupleElementIsConciergeReportID(call, elementIndex) {
        if (call?.type !== 'CallExpression') {
            return false;
        }

        if (isUseOnyxCall(call)) {
            return elementIndex === 0 && !hasSelectorOption(call) && getMemberKeyPath(call.arguments.at(0)) === CONCIERGE_REPORT_ID_KEY_PATH;
        }

        if (getCalledReadMethod(call.callee, {constOnly: true}) !== MULTI_READ_METHOD) {
            return false;
        }

        const keyElements = getKeyListElements(call.arguments.at(0), sourceCode, isMultiReadCall)?.slice(0, elementIndex + 1);

        // A spread before the slot shifts every later index at runtime, so the slot cannot be matched to a key
        if (keyElements?.length !== elementIndex + 1 || keyElements.some((element) => !element || element.type === 'SpreadElement')) {
            return false;
        }

        return getMemberKeyPath(keyElements.at(elementIndex)) === CONCIERGE_REPORT_ID_KEY_PATH;
    }

    // True when the ID is a const bound, in this file, to a read of ONYXKEYS.CONCIERGE_REPORT_ID
    function isConciergeReportIDExpression(node) {
        const current = unwrapTypeOnlyExpressions(node);

        if (current?.type !== 'Identifier') {
            return false;
        }

        const definition = getSingleVariableDefinition(resolveVariable(current, sourceCode), true);

        if (!definition) {
            return false;
        }

        const {id, init} = definition.node;
        const call = unwrapAwaitAndTypeOnlyExpressions(init);

        if (id.type === 'Identifier') {
            return readsConciergeReportID(call);
        }

        if (id.type !== 'ArrayPattern') {
            return false;
        }

        const elementIndex = getBoundElementIndex(id, current.name);

        return elementIndex !== -1 && tupleElementIsConciergeReportID(call, elementIndex);
    }

    // `${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`, written inline or through a const
    function isConciergeChatKey(node, seen = new Set()) {
        const current = unwrapTypeOnlyExpressions(node);

        if (current?.type === 'Identifier') {
            if (seen.has(current)) {
                return false;
            }

            seen.add(current);
            const initializer = getConstInitializer(current, sourceCode);

            return !!initializer && isConciergeChatKey(initializer, seen);
        }

        // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
        if (current?.type !== 'TemplateLiteral' || current.expressions.length !== 2 || current.quasis.some((quasi) => quasi.value.cooked !== '')) {
            return false;
        }

        return getMemberKeyPath(current.expressions.at(0)) === REPORT_COLLECTION_KEY_PATH && isConciergeReportIDExpression(current.expressions.at(1));
    }

    function findRestrictedKey(keyArgument) {
        const keyPath = getOnyxKeyPath(keyArgument, sourceCode);

        if (!keyPath) {
            return {keyPath: null};
        }

        if (!RESTRICTED_KEY_PATHS.has(keyPath) || isConciergeChatKey(keyArgument)) {
            return null;
        }

        return {keyPath};
    }

    function findRestrictedKeys(readMethod, call) {
        const keyArgument = call.arguments.at(0);

        if (readMethod !== MULTI_READ_METHOD) {
            const finding = findRestrictedKey(keyArgument);

            return finding ? [{node: call, ...finding}] : [];
        }

        const elements = keyArgument?.type === 'SpreadElement' ? null : getKeyListElements(keyArgument, sourceCode, isMultiReadCall);

        if (!elements) {
            return [{node: call, keyPath: null}];
        }

        return elements.flatMap((element) => {
            if (!element || element.type === 'SpreadElement') {
                return [{node: element ?? call, keyPath: null}];
            }

            const finding = findRestrictedKey(element);

            return finding ? [{node: element, ...finding}] : [];
        });
    }

    return {
        CallExpression(node) {
            const readMethod = getCalledReadMethod(node.callee);

            if (!readMethod) {
                return;
            }

            for (const finding of findRestrictedKeys(readMethod, node)) {
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
