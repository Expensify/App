const name = 'no-onyx-read-after-write';

/** Import sources that resolve to the Onyx library, including `react-native-onyx/dist/OnyxUtils`. */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** Synchronous read APIs on the Onyx surface. All of them read the cache and nothing else. */
const SYNC_READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

/**
 * Write APIs whose effect a later read in the same tick cannot be trusted to see. `merge` and `update`
 * apply in a later microtask, so the read is definitely stale. `set`, `multiSet`, `mergeCollection`,
 * `setCollection` and `clear` do write the cache synchronously today, which is exactly why relying on
 * it is fragile: the same call inside `update()` is deferred, and the distinction is not visible here.
 */
const WRITE_METHODS = new Set(['merge', 'update', 'set', 'multiSet', 'mergeCollection', 'setCollection', 'clear']);

/**
 * Array methods whose callback runs in the caller's own tick. A function boundary here defers nothing,
 * so a read inside one is as much a same-tick read as a read written inline.
 */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow a synchronous Onyx read that follows an un-awaited Onyx write in the same function body. Writes apply to the cache in a later microtask, so the read returns the pre-write value.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxReadAfterWrite:
            'Do not read Onyx after writing it in the same tick. Onyx.merge() and Onyx.update() apply their changes to the cache in a later microtask, so a synchronous read that follows one returns the pre-write value. Onyx.set() and Onyx.mergeCollection() do happen to be visible immediately, which makes code that depends on the difference fragile rather than safe.\n\n' +
            'Do all of the reads before the first write, or await the write before reading. Reads of keys the tick has not written are always current.',
    },
};

function isFunctionNode(node) {
    return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
}

/** The static name a key node stands for, covering both `a.b` and `a['b']`. */
function getStaticName(keyNode, computed) {
    if (!computed && keyNode.type === 'Identifier') {
        return keyNode.name;
    }

    if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
        return keyNode.value;
    }

    return null;
}

function getStaticPropertyName(memberExpression) {
    return getStaticName(memberExpression.property, memberExpression.computed);
}

function matchesCalleeName(callee, names) {
    if (callee.type === 'Identifier') {
        return names.has(callee.name);
    }

    if (callee.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(callee);
        return !!propertyName && names.has(propertyName);
    }

    return false;
}

/**
 * Whether a function boundary runs in its caller's own tick. An IIFE and a synchronous array callback
 * both do, so neither moves a read or a write out of the surrounding body. Every other boundary means
 * something has to call it, and when that happens is not knowable here.
 */
function isTransparentBoundary(functionNode, parent) {
    if (parent?.type !== 'CallExpression') {
        return false;
    }

    if (parent.callee === functionNode) {
        return true;
    }

    return parent.arguments.includes(functionNode) && parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS);
}

/**
 * The body a node runs in, which is the innermost enclosing function once transparent boundaries are
 * seen through. `null` means module scope, which is `no-onyx-read-at-module-scope`'s brief: every read
 * there is already reported, so pairing them with a write would only report the same line twice.
 */
function getEnclosingBody(ancestors) {
    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (isFunctionNode(ancestor) && !isTransparentBoundary(ancestor, ancestors[index - 1] ?? null)) {
            return ancestor;
        }
    }

    return null;
}

/**
 * Whether the call settles before the surrounding statement finishes. Only a syntactic `await` counts,
 * reached through expressions such as `Promise.all([...])`; a statement boundary or a function boundary
 * in between means it does not.
 */
function isAwaited(ancestors) {
    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (ancestor.type === 'AwaitExpression') {
            return true;
        }

        if (isFunctionNode(ancestor) || ancestor.type.endsWith('Statement') || ancestor.type.endsWith('Declaration')) {
            return false;
        }
    }

    return false;
}

/**
 * The dotted path a key expression is written as, or `null` when it is computed at runtime. A collection
 * member reads as its collection: `` `${ONYXKEYS.COLLECTION.REPORT}${reportID}` `` gives the prefix path,
 * which is what one member and another share and what two collections cannot.
 */
function getStaticKeyPath(keyNode) {
    if (!keyNode) {
        return null;
    }

    if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
        return `'${keyNode.value}'`;
    }

    if (keyNode.type === 'Identifier') {
        return keyNode.name;
    }

    if (keyNode.type === 'TemplateLiteral') {
        return keyNode.quasis.at(0)?.value.raw === '' ? getStaticKeyPath(keyNode.expressions.at(0)) : null;
    }

    if (keyNode.type !== 'MemberExpression') {
        return null;
    }

    const propertyName = getStaticPropertyName(keyNode);
    const objectPath = getStaticKeyPath(keyNode.object);

    return propertyName && objectPath ? `${objectPath}.${propertyName}` : null;
}

/** Writes whose first argument names the single key, or the single collection, the call touches. */
const SINGLE_KEY_WRITE_METHODS = new Set(['merge', 'set', 'mergeCollection', 'setCollection']);

/**
 * Whether the two calls provably touch different keys, which is the one case A1's rule exempts: reads of
 * keys the tick did not write are always current. It has to be provable, so both keys must be static paths
 * that differ only in their last segment, which is how `ONYXKEYS` is used. Two properties of one object
 * there hold two different key strings; two paths from different objects can hold the same string, and
 * three pairs do, each an `ONYXKEYS.X` aliased by an `ONYXKEYS.FORMS.X_FORM`. Bare identifiers are not
 * enough either, since two of them can hold the same key, and a write that takes no single key
 * (`update`, `multiSet`, `clear`) can touch anything.
 */
function isProvablyDifferentKey(writeCall, readCall) {
    const writeMethod = writeCall.callee.type === 'MemberExpression' ? getStaticPropertyName(writeCall.callee) : null;
    const readMethod = readCall.callee.type === 'MemberExpression' ? getStaticPropertyName(readCall.callee) : null;

    if (!writeMethod || !SINGLE_KEY_WRITE_METHODS.has(writeMethod) || readMethod !== 'get') {
        return false;
    }

    const writePath = getStaticKeyPath(writeCall.arguments.at(0));
    const readPath = getStaticKeyPath(readCall.arguments.at(0));

    if (!writePath || !readPath || !writePath.includes('.') || !readPath.includes('.') || writePath === readPath) {
        return false;
    }

    const writeSegments = writePath.split('.');
    const readSegments = readPath.split('.');

    return writeSegments.length === readSegments.length && writeSegments.slice(0, -1).join('.') === readSegments.slice(0, -1).join('.');
}

/** Statements that leave the enclosing function, so nothing after them in that body runs. */
const EXITING_STATEMENTS = new Set(['ReturnStatement', 'ThrowStatement']);

function endsByExiting(block) {
    const last = block.body.at(-1);

    if (!last) {
        return false;
    }

    return EXITING_STATEMENTS.has(last.type) || (last.type === 'BlockStatement' && endsByExiting(last));
}

/**
 * Whether running the write means leaving the function before the read is reached, which is the guard-clause
 * shape: `if (isSpecialCase) { Onyx.merge(...); return; }` followed by a read. Only `return` and `throw`
 * count. A `break` or `continue` leaves a loop rather than the body, and the read can still follow.
 */
function exitsBeforeRead(write, read) {
    const readAncestors = new Set(read.ancestors);

    return write.ancestors.some((ancestor) => ancestor.type === 'BlockStatement' && !readAncestors.has(ancestor) && endsByExiting(ancestor));
}

/** The two nodes' ancestor chains diverge here: the shared parent, and the child of it each one sits under. */
function findDivergence(write, read) {
    // The calls themselves are the last link, since they can be a branch: `cond ? write() : read()`.
    const writeChain = [...write.ancestors, write.node];
    const readChain = [...read.ancestors, read.node];
    const depth = Math.min(writeChain.length, readChain.length);

    for (let index = 0; index < depth; index++) {
        if (writeChain[index] !== readChain[index]) {
            return {
                parent: writeChain[index - 1] ?? null,
                writeBranch: writeChain[index],
                readBranch: readChain[index],
            };
        }
    }

    return null;
}

/** Whether only one of the two calls can run, so the write cannot have happened by the time the read does. */
function areMutuallyExclusive(write, read) {
    const divergence = findDivergence(write, read);

    if (!divergence?.parent) {
        return false;
    }

    const {parent, writeBranch, readBranch} = divergence;

    if (parent.type === 'IfStatement' || parent.type === 'ConditionalExpression') {
        return (parent.consequent === writeBranch && parent.alternate === readBranch) || (parent.alternate === writeBranch && parent.consequent === readBranch);
    }

    // Separate cases of one switch. Fallthrough can reach the read from the write's case, but that shape
    // (a write in a case that deliberately falls through into a read) is not worth the false positives.
    return parent.type === 'SwitchStatement' && writeBranch.type === 'SwitchCase' && readBranch.type === 'SwitchCase';
}

/**
 * Flags a synchronous Onyx read that runs after an un-awaited Onyx write in the same body, which A1
 * measured returns the pre-write value. Source order within the body is what decides "after", so a read
 * placed above the write is fine even though a loop could run it again afterwards.
 *
 * The object has to resolve to an import from `react-native-onyx`, so a local object that happens to
 * expose `get` and `merge` is left alone.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const onyxImportBindings = new WeakSet();
    const readAliases = new WeakSet();
    const writeAliases = new WeakSet();

    /** Reads and writes per enclosing body, in source order. Bodies are only compared against themselves. */
    const callsByBody = new Map();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }
    }

    function getVariableByName(scope, variableName) {
        let currentScope = scope;

        while (currentScope) {
            const variable = currentScope.variables.find((scopeVariable) => scopeVariable.name === variableName);

            if (variable) {
                return variable;
            }

            currentScope = currentScope.upper;
        }

        return null;
    }

    function isOnyxMember(node, scope, methods) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return false;
        }

        const methodName = getStaticPropertyName(node);

        if (!methodName || !methods.has(methodName)) {
            return false;
        }

        const objectVariable = getVariableByName(scope, node.object.name);
        return !!objectVariable && onyxImportBindings.has(objectVariable);
    }

    function record(node, ancestors, kind) {
        const body = getEnclosingBody(ancestors);

        if (!body) {
            return;
        }

        const calls = callsByBody.get(body) ?? {reads: [], writes: []};
        calls[kind].push({node, ancestors});
        callsByBody.set(body, calls);
    }

    return {
        ImportDeclaration(node) {
            if (typeof node.source.value !== 'string' || (node.source.value !== ONYX_MODULE_PREFIX && !node.source.value.startsWith(`${ONYX_MODULE_PREFIX}/`))) {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackBinding(node, specifier.local.name, onyxImportBindings);
                }
            }
        },
        VariableDeclarator(node) {
            const scope = sourceCode.getScope(node);

            // const {get, merge} = Onyx;  /  const {get: readOnyx} = Onyx;
            if (node.id.type === 'ObjectPattern' && node.init?.type === 'Identifier') {
                const initVariable = getVariableByName(scope, node.init.name);

                if (!initVariable || !onyxImportBindings.has(initVariable)) {
                    return;
                }

                for (const property of node.id.properties) {
                    if (property.type !== 'Property' || property.value.type !== 'Identifier') {
                        continue;
                    }

                    const keyName = getStaticName(property.key, property.computed);

                    if (keyName && SYNC_READ_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, readAliases);
                    }

                    if (keyName && WRITE_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, writeAliases);
                    }
                }
                return;
            }

            // const readOnyx = Onyx.get;
            if (node.id.type !== 'Identifier') {
                return;
            }

            if (isOnyxMember(node.init, scope, SYNC_READ_METHODS)) {
                trackBinding(node, node.id.name, readAliases);
            } else if (isOnyxMember(node.init, scope, WRITE_METHODS)) {
                trackBinding(node, node.id.name, writeAliases);
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;

            if (isOnyxMember(node.callee, scope, SYNC_READ_METHODS) || (!!calleeVariable && readAliases.has(calleeVariable))) {
                record(node, sourceCode.getAncestors(node), 'reads');
                return;
            }

            if (isOnyxMember(node.callee, scope, WRITE_METHODS) || (!!calleeVariable && writeAliases.has(calleeVariable))) {
                record(node, sourceCode.getAncestors(node), 'writes');
            }
        },
        // Reported here rather than on the read, because a read is only a finding once the whole body is known.
        'Program:exit': function reportReadsAfterWrites() {
            for (const {reads, writes} of callsByBody.values()) {
                for (const read of reads) {
                    const precedingWrite = writes.find(
                        (write) =>
                            // The read's text starts after the write call's, so it also runs after it. Containment is
                            // the case this excludes: a read passed as an argument to the write runs before it.
                            read.node.range.at(0) >= write.node.range.at(1) &&
                            !isAwaited(write.ancestors) &&
                            !areMutuallyExclusive(write, read) &&
                            !exitsBeforeRead(write, read) &&
                            !isProvablyDifferentKey(write.node, read.node),
                    );

                    if (!precedingWrite) {
                        continue;
                    }

                    context.report({
                        node: read.node,
                        messageId: 'noOnyxReadAfterWrite',
                    });
                }
            }
        },
    };
}

export {name, meta, create};
