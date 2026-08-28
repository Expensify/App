const name = 'no-unsafe-onyx-read';

/**
 * Import sources that resolve to the Onyx library, including `react-native-onyx/dist/OnyxUtils`.
 */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** EApp's wrapper around the library. Reads are supposed to go through it, so it is a read surface too. */
const ONYX_WRAPPER_MODULE = '@libs/OnyxUtils';

/** One-shot read APIs on the Onyx surface. They return a Promise and none of them subscribe. */
const READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

/**
 * Write APIs a later read in the same tick cannot be trusted to see. None is exempt: which ones land
 * immediately is version-dependent, and any `set` inside `update()` is deferred regardless.
 */
const WRITE_METHODS = new Set(['merge', 'update', 'set', 'multiSet', 'mergeCollection', 'setCollection', 'clear']);

/** Array methods that write in place, so calling one on a read result edits the cache. */
const MUTATING_ARRAY_METHODS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin']);

/** Array methods whose callback runs in the caller's own tick, so the boundary defers nothing. */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

/** Hooks whose callback runs during render, unlike useCallback and useEffect. */
const RENDER_TIME_HOOK_NAMES = new Set(['useMemo']);

/** Calls that wrap a component without deferring it, so their callback argument is still a render body. */
const COMPONENT_WRAPPER_NAMES = new Set(['memo', 'forwardRef']);

/** Constructors whose first argument runs during construction rather than later. */
const SYNCHRONOUS_EXECUTOR_NAMES = new Set(['Promise']);

/** What a function boundary does to the timing of the code inside it. */
const RENDER = 'render';
const DEFERRED = 'deferred';
const SYNCHRONOUS = 'synchronous';

/** Where a read runs, which is what decides the message it gets. `RENDER` is shared with the set above. */
const MODULE_SCOPE = 'moduleScope';
const EVENT = 'event';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow unsafe Onyx reads (Onyx.get and friends): during render, where the read does not subscribe; at module scope, where it can only be parked in a stale module variable; and after an un-awaited write in the same body, where it resolves to the pre-write value.',
        recommended: 'error',
    },
    schema: [
        {
            type: 'object',
            properties: {
                // Reads must go through this wrapper rather than the library.
                readSurface: {type: 'string'},
            },
            additionalProperties: false,
        },
    ],
    messages: {
        noOnyxGetInRender:
            'Do not read Onyx during render. Onyx.get() is a one-shot read that never subscribes, so a value obtained while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() for code that runs on an event: event handlers, useCallback and useEffect bodies, and plain module functions.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noOnyxReadAfterWrite:
            'Do not read Onyx after writing it in the same tick. Onyx.get() samples the cache when it is called and the Promise only defers delivery, so awaiting the read cannot wait for a pending write. Which writes land before returning is version-dependent and a set inside update() is deferred either way, so no write is exempt here.\n\n' +
            'Do all of the reads before the first write, or await the write before reading. Reads of keys the tick has not written are always current.',
        noDirectOnyxGet:
            "Do not read Onyx straight from the library. {{readSurface}} is this repo's read surface and refuses the Search snapshot keys, which src/hooks/useOnyx.ts redirects to snapshot_<hash> in a way the library cannot see. Reading around it returns live data where the component would have seen the snapshot.\n\n" +
            'Import the wrapper from {{readSurface}} and call its get() instead.',
        noMutatedOnyxRead:
            'Do not mutate the result of an Onyx read. A single key resolves to the cached object itself rather than a copy, so this writes straight into the cache and no subscriber is told. A collection resolves frozen and throws instead, which makes this the silent case.\n\n' +
            'Spread it first, or build the change into a new object.',
    },
};

function isFunctionNode(node) {
    return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
}

function isHookName(functionName) {
    return /^use[A-Z0-9]/.test(functionName);
}

function isComponentName(functionName) {
    return /^[A-Z]/.test(functionName);
}

function getFunctionName(functionNode, parent) {
    if (functionNode.id?.type === 'Identifier') {
        return functionNode.id.name;
    }

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
    }

    if (parent?.type === 'Property' && !parent.computed && parent.key?.type === 'Identifier') {
        return parent.key.name;
    }

    return null;
}

/** A function that returns JSX is a render body whatever it is called, which covers anonymous default exports. */
function returnsJSX(functionNode) {
    const body = functionNode.body;

    if (!body) {
        return false;
    }

    if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
        return true;
    }

    if (body.type !== 'BlockStatement') {
        return false;
    }

    return body.body.some((statement) => statement.type === 'ReturnStatement' && (statement.argument?.type === 'JSXElement' || statement.argument?.type === 'JSXFragment'));
}

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

function isOnyxModuleSource(sourceValue) {
    return typeof sourceValue === 'string' && (sourceValue === ONYX_MODULE_PREFIX || sourceValue.startsWith(`${ONYX_MODULE_PREFIX}/`));
}

function isOnyxWrapperSource(sourceValue) {
    return sourceValue === ONYX_WRAPPER_MODULE;
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

/**
 * `SYNCHRONOUS` means the boundary is transparent, an IIFE or an array callback, so a walk outwards
 * continues through it.
 */
function classifyFunctionBoundary(functionNode, parent) {
    // `new Promise((resolve) => ...)` runs its executor while the constructor is still on the stack, so the
    // read inside one happens in the constructing body's own tick, render included.
    if (parent?.type === 'NewExpression' && parent.arguments.at(0) === functionNode && matchesCalleeName(parent.callee, SYNCHRONOUS_EXECUTOR_NAMES)) {
        return SYNCHRONOUS;
    }

    if (parent?.type === 'CallExpression') {
        if (parent.callee === functionNode) {
            return SYNCHRONOUS;
        }

        if (parent.arguments.includes(functionNode)) {
            if (matchesCalleeName(parent.callee, COMPONENT_WRAPPER_NAMES) || matchesCalleeName(parent.callee, RENDER_TIME_HOOK_NAMES)) {
                return RENDER;
            }

            if (parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS)) {
                return SYNCHRONOUS;
            }

            return DEFERRED;
        }
    }

    const functionName = getFunctionName(functionNode, parent);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
        return RENDER;
    }

    return returnsJSX(functionNode) ? RENDER : DEFERRED;
}

/**
 * A JSX expression sets a flag rather than deciding on the spot, so a read written straight into JSX at
 * module scope is reported as the module-scope read it is. Inside any boundary the flag still wins.
 */
function classifyPosition(ancestors) {
    let sawJSXExpression = false;

    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (ancestor.type === 'JSXExpressionContainer') {
            sawJSXExpression = true;
            continue;
        }

        if (!isFunctionNode(ancestor)) {
            continue;
        }

        if (sawJSXExpression) {
            return RENDER;
        }

        const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null);

        if (disposition === DEFERRED) {
            return EVENT;
        }

        if (disposition === RENDER) {
            return RENDER;
        }
    }

    return MODULE_SCOPE;
}

function isTransparentBoundary(functionNode, parent) {
    return classifyFunctionBoundary(functionNode, parent) === SYNCHRONOUS;
}

/**
 * The body an `await` suspends, which is the innermost enclosing function with no transparency: `await`
 * only suspends the async function it is written in. An async callback passed to `forEach` suspends
 * itself while `forEach` carries on, even though a plain call in that callback does run in its caller's tick.
 */
function getAwaitingBody(ancestors) {
    return ancestors.findLast(isFunctionNode) ?? null;
}

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
 * The `await` a call is written under, reached through expressions such as `Promise.all([...])`, or
 * `null` when there is none. Only a syntactic `await` counts.
 */
function getEnclosingAwait(ancestors) {
    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (ancestor.type === 'AwaitExpression') {
            return ancestor;
        }

        if (isFunctionNode(ancestor) || ancestor.type.endsWith('Statement') || ancestor.type.endsWith('Declaration')) {
            return null;
        }
    }

    return null;
}

/**
 * Whether the write's own `await` finishes before the read starts. It does not when the read sits inside
 * that same awaited expression: `await Promise.all([Onyx.merge(key, value), OnyxUtils.get(key)])` calls
 * the read in the write's tick, so the await it shares defers nothing between them.
 */
function isAwaitedBeforeRead(write, read) {
    const awaitNode = getEnclosingAwait(write.ancestors);

    return !!awaitNode && read.node.range.at(0) >= awaitNode.range.at(1);
}

/**
 * An `await` ends the write's tick: the read resumes in a later one, after the queued write has had its
 * turn. `await waitForBatchedUpdates()` in tests is this shape, and so is awaiting the write's promise
 * indirectly, through a handle taken earlier in the body.
 */
function isSeparatedByAwait(awaits, write, read) {
    return awaits.some((awaitNode) => awaitNode.range.at(0) >= write.node.range.at(1) && awaitNode.range.at(1) <= read.node.range.at(0));
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
        // A collection member opens with its prefix expression, so the first expression starts three
        // characters into the literal, one for the backtick and two for the `${`.
        const [firstExpression] = keyNode.expressions;

        return firstExpression?.range.at(0) === keyNode.range.at(0) + 3 ? getStaticKeyPath(firstExpression) : null;
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
 * Whether the two calls provably touch different keys, the one exemption: a read of a key the tick did
 * not write is always current. It has to be provable, so both keys must be static paths differing only
 * in their last segment, which is how `ONYXKEYS` is used. Two paths from different objects can hold the
 * same string, and three pairs do, each an `ONYXKEYS.X` aliased by an `ONYXKEYS.FORMS.X_FORM`. Bare
 * identifiers are not enough either, and a write with no single key argument can touch anything.
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

function getRootIdentifier(node) {
    let current = node;

    while (current?.type === 'MemberExpression' || current?.type === 'ChainExpression') {
        current = current.type === 'ChainExpression' ? current.expression : current.object;
    }

    return current?.type === 'Identifier' ? current : null;
}

/**
 * Whether the initializer hands back a value the cache owns: an awaited read, or a property reached off
 * one. A spread or a method call in between produces a copy, and copies are the fix rather than the bug.
 */
function isCacheOwnedInit(node, isReadCall) {
    let current = node;

    while (current) {
        if (current.type === 'AwaitExpression') {
            current = current.argument;
            continue;
        }

        if (current.type === 'ChainExpression') {
            current = current.expression;
            continue;
        }

        if (current.type === 'MemberExpression') {
            current = current.object;
            continue;
        }

        return current.type === 'CallExpression' && isReadCall(current);
    }

    return false;
}

const EXITING_STATEMENTS = new Set(['ReturnStatement', 'ThrowStatement']);

function endsByExiting(block) {
    const last = block.body.at(-1);

    if (!last) {
        return false;
    }

    return EXITING_STATEMENTS.has(last.type) || (last.type === 'BlockStatement' && endsByExiting(last));
}

/**
 * The guard-clause shape, `if (isSpecialCase) { Onyx.merge(...); return; }` followed by a read: running
 * the write means leaving before the read. Only `return` and `throw` count, since a `break` or
 * `continue` leaves a loop rather than the body.
 */
function exitsBeforeRead(write, read) {
    const readAncestors = new Set(read.ancestors);

    return write.ancestors.some((ancestor) => ancestor.type === 'BlockStatement' && !readAncestors.has(ancestor) && endsByExiting(ancestor));
}

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
 * Hydration is not one of the axes: `Onyx.get` resolves only after `Onyx.init`.
 *
 * One read gets one message, position first.
 *
 * The object has to resolve to an import from `react-native-onyx`, so a local object that happens to
 * expose `get` and `merge` is left alone.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const {readSurface} = context.options.at(0) ?? {};
    const onyxImportBindings = new WeakSet();
    const libraryImportBindings = new WeakSet();
    const readAliases = new WeakSet();
    /** Variables holding a value the cache owns, so writing through them writes the cache. */
    const cacheOwnedBindings = new WeakSet();
    const libraryReadAliases = new WeakSet();
    const writeAliases = new WeakSet();

    /** Event-time reads, writes and awaits per enclosing body, in source order. Bodies are only compared against themselves. */
    const callsByBody = new Map();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }
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

    function isReadCall(node, scope) {
        const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;
        return isOnyxMember(node.callee, scope, READ_METHODS) || (!!calleeVariable && readAliases.has(calleeVariable));
    }

    function reportIfCacheOwned(node, target, scope) {
        const root = getRootIdentifier(target);
        const variable = root ? getVariableByName(scope, root.name) : null;

        if (variable && cacheOwnedBindings.has(variable)) {
            context.report({node, messageId: 'noMutatedOnyxRead'});
        }
    }

    function record(node, ancestors, kind) {
        const body = getEnclosingBody(ancestors);

        if (!body) {
            return;
        }

        const calls = callsByBody.get(body) ?? {reads: [], writes: [], awaits: []};
        calls[kind].push({node, ancestors});
        callsByBody.set(body, calls);
    }

    return {
        ImportDeclaration(node) {
            if (!isOnyxModuleSource(node.source.value) && !isOnyxWrapperSource(node.source.value)) {
                return;
            }

            const isLibrary = isOnyxModuleSource(node.source.value);

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackBinding(node, specifier.local.name, onyxImportBindings);

                    if (isLibrary) {
                        trackBinding(node, specifier.local.name, libraryImportBindings);
                    }
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

                    if (keyName && READ_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, readAliases);

                        if (libraryImportBindings.has(initVariable)) {
                            trackBinding(node, property.value.name, libraryReadAliases);
                        }
                    }

                    if (keyName && WRITE_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, writeAliases);
                    }
                }
                return;
            }

            if (node.id.type !== 'Identifier') {
                return;
            }

            if (node.parent?.kind === 'const' && isCacheOwnedInit(node.init, (call) => isReadCall(call, scope))) {
                trackBinding(node, node.id.name, cacheOwnedBindings);
            }

            // const readOnyx = Onyx.get;

            if (isOnyxMember(node.init, scope, READ_METHODS)) {
                trackBinding(node, node.id.name, readAliases);
            } else if (isOnyxMember(node.init, scope, WRITE_METHODS)) {
                trackBinding(node, node.id.name, writeAliases);
            }
        },
        AssignmentExpression(node) {
            reportIfCacheOwned(node, node.left, sourceCode.getScope(node));
        },
        UpdateExpression(node) {
            reportIfCacheOwned(node, node.argument, sourceCode.getScope(node));
        },
        UnaryExpression(node) {
            if (node.operator !== 'delete') {
                return;
            }

            reportIfCacheOwned(node, node.argument, sourceCode.getScope(node));
        },
        AwaitExpression(node) {
            const body = getAwaitingBody(sourceCode.getAncestors(node));

            if (!body) {
                return;
            }

            const calls = callsByBody.get(body) ?? {reads: [], writes: [], awaits: []};
            calls.awaits.push(node);
            callsByBody.set(body, calls);
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);

            // `Object.assign(target, ...)` and `target.push(...)` write through their target.
            if (node.callee.type === 'MemberExpression') {
                const methodName = getStaticPropertyName(node.callee);

                if (methodName === 'assign' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'Object') {
                    reportIfCacheOwned(node, node.arguments.at(0), scope);
                } else if (methodName && MUTATING_ARRAY_METHODS.has(methodName)) {
                    reportIfCacheOwned(node, node.callee.object, scope);
                }
            }

            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;

            if (isOnyxMember(node.callee, scope, READ_METHODS) || (!!calleeVariable && readAliases.has(calleeVariable))) {
                const ancestors = sourceCode.getAncestors(node);

                const position = classifyPosition(ancestors);

                if (position === MODULE_SCOPE) {
                    context.report({node, messageId: 'noOnyxReadAtModuleScope'});
                    return;
                }

                if (position === RENDER) {
                    context.report({node, messageId: 'noOnyxGetInRender'});
                    return;
                }

                if (readSurface) {
                    const objectVariable = node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' ? getVariableByName(scope, node.callee.object.name) : null;

                    if ((!!objectVariable && libraryImportBindings.has(objectVariable)) || (!!calleeVariable && libraryReadAliases.has(calleeVariable))) {
                        context.report({node, messageId: 'noDirectOnyxGet', data: {readSurface}});
                        return;
                    }
                }

                record(node, ancestors, 'reads');
                return;
            }

            if (isOnyxMember(node.callee, scope, WRITE_METHODS) || (!!calleeVariable && writeAliases.has(calleeVariable))) {
                record(node, sourceCode.getAncestors(node), 'writes');
            }
        },
        // Reported here rather than on the read, because a read is only a finding once the whole body is known.
        'Program:exit': function reportReadsAfterWrites() {
            for (const {reads, writes, awaits} of callsByBody.values()) {
                for (const read of reads) {
                    const precedingWrite = writes.find(
                        (write) =>
                            // The read's text starts after the write call's, so it also runs after it. Containment is
                            // the case this excludes: a read passed as an argument to the write runs before it.
                            read.node.range.at(0) >= write.node.range.at(1) &&
                            !isAwaitedBeforeRead(write, read) &&
                            !isSeparatedByAwait(awaits, write, read) &&
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
