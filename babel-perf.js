module.exports = function ({types: t}) {
    return {
        visitor: {
            Program(path, state) {
                // Get the filename from Babel's state
                const filename = state.file.opts.filename;

                // Do not process files in node_modules
                if (filename.includes('node_modules/')) {
                    return;
                }

                // Add global initialization for metrics storage
                const metricsInit = t.expressionStatement(
                    t.assignmentExpression(
                        '=',
                        t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')),
                        t.logicalExpression('||', t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.newExpression(t.identifier('Map'), [])),
                    ),
                );

                // Insert metrics initialization at the top of the program
                path.node.body.unshift(metricsInit);
            },
            Function(path) {
                const functionName = getFunctionName(path);
                if (!functionName) {
                    // Skip anonymous or unnamed functions
                    return;
                }

                // Prevent double instrumentation
                if (path.node._instrumented) {
                    return;
                }
                path.node._instrumented = true;

                console.log(`[DEBUG] Instrumenting function: ${functionName}`);

                // Generate hoisted variables
                const timerId = path.scope.generateUidIdentifier('startTime');
                const returnValueVariable = path.scope.generateUidIdentifier('_returnValue');
                const elapsedTimeVariable = path.scope.generateUidIdentifier('_elapsedTime');

                // Add metrics initialization
                const initMetrics = t.expressionStatement(
                    t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('set')), [
                        t.stringLiteral(functionName),
                        t.logicalExpression(
                            '||',
                            t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                t.stringLiteral(functionName),
                            ]),
                            t.objectExpression([t.objectProperty(t.identifier('count'), t.numericLiteral(0)), t.objectProperty(t.identifier('time'), t.numericLiteral(0))]),
                        ),
                    ]),
                );

                // Start timer declaration
                const startTimer = t.variableDeclaration('const', [
                    t.variableDeclarator(timerId, t.callExpression(t.memberExpression(t.identifier('performance'), t.identifier('now')), [])),
                ]);

                // Hoist `_returnValue` and `_elapsedTime` to the top of the function
                const hoistedVariables = t.variableDeclaration('let', [t.variableDeclarator(returnValueVariable), t.variableDeclarator(elapsedTimeVariable)]);

                const body = path.get('body');

                if (body.isBlockStatement()) {
                    // Add metrics initialization, start timer, and hoisted variables
                    body.node.body.unshift(initMetrics, startTimer, hoistedVariables);

                    // Add implicit return instrumentation for functions without explicit `return`
                    if (!hasReturnStatement(body)) {
                        const implicitReturnInstrumentation = createImplicitReturnInstrumentation(t, functionName, timerId, returnValueVariable, elapsedTimeVariable);
                        body.node.body.push(...implicitReturnInstrumentation);
                    }
                } else {
                    // For non-block functions (like arrow functions), wrap in a block
                    body.replaceWith(t.blockStatement([initMetrics, startTimer, hoistedVariables, t.returnStatement(body.node)]));
                }

                // Transform explicit return statements
                const returnStatements = [];
                path.traverse({
                    ReturnStatement(returnPath) {
                        returnStatements.push(returnPath);
                    },
                });

                for (const returnPath of returnStatements) {
                    if (returnPath.node._instrumented) {
                        continue;
                    }
                    returnPath.node._instrumented = true;

                    // Use hoisted `_returnValue` and `_elapsedTime` for explicit return
                    const instrumentedNodes = createExplicitReturnInstrumentation(t, functionName, timerId, returnValueVariable, elapsedTimeVariable, returnPath.node.argument);
                    returnPath.replaceWithMultiple(instrumentedNodes);
                }
            },
        },
    };

    /**
     * Create instrumentation for implicit returns
     */
    function createImplicitReturnInstrumentation(t, functionName, timerId, returnValueVariable, elapsedTimeVariable) {
        const elapsedTime = t.expressionStatement(
            t.assignmentExpression('=', elapsedTimeVariable, t.binaryExpression('-', t.callExpression(t.memberExpression(t.identifier('performance'), t.identifier('now')), []), timerId)),
        );

        const updateMetrics = t.expressionStatement(
            t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('set')), [
                t.stringLiteral(functionName),
                t.objectExpression([
                    t.objectProperty(
                        t.identifier('count'),
                        t.binaryExpression(
                            '+',
                            t.memberExpression(
                                t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                    t.stringLiteral(functionName),
                                ]),
                                t.identifier('count'),
                            ),
                            t.numericLiteral(1),
                        ),
                    ),
                    t.objectProperty(
                        t.identifier('time'),
                        t.binaryExpression(
                            '+',
                            t.memberExpression(
                                t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                    t.stringLiteral(functionName),
                                ]),
                                t.identifier('time'),
                            ),
                            elapsedTimeVariable,
                        ),
                    ),
                ]),
            ]),
        );

        return [elapsedTime, updateMetrics, t.returnStatement(returnValueVariable)];
    }

    /**
     * Create instrumentation for explicit return statements
     */
    function createExplicitReturnInstrumentation(t, functionName, timerId, returnValueVariable, elapsedTimeVariable, argument) {
        const assignReturnValue = t.expressionStatement(t.assignmentExpression('=', returnValueVariable, argument || t.identifier('undefined')));

        const elapsedTime = t.expressionStatement(
            t.assignmentExpression('=', elapsedTimeVariable, t.binaryExpression('-', t.callExpression(t.memberExpression(t.identifier('performance'), t.identifier('now')), []), timerId)),
        );

        const updateMetrics = t.expressionStatement(
            t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('set')), [
                t.stringLiteral(functionName),
                t.objectExpression([
                    t.objectProperty(
                        t.identifier('count'),
                        t.binaryExpression(
                            '+',
                            t.memberExpression(
                                t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                    t.stringLiteral(functionName),
                                ]),
                                t.identifier('count'),
                            ),
                            t.numericLiteral(1),
                        ),
                    ),
                    t.objectProperty(
                        t.identifier('time'),
                        t.binaryExpression(
                            '+',
                            t.memberExpression(
                                t.callExpression(t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                    t.stringLiteral(functionName),
                                ]),
                                t.identifier('time'),
                            ),
                            elapsedTimeVariable,
                        ),
                    ),
                ]),
            ]),
        );

        return [assignReturnValue, elapsedTime, updateMetrics, t.returnStatement(returnValueVariable)];
    }

    /**
     * Check if a function contains any explicit return statements
     */
    function hasReturnStatement(body) {
        let hasReturn = false;
        body.traverse({
            ReturnStatement() {
                hasReturn = true;
            },
        });
        return hasReturn;
    }

    /**
     * Get the name of a function
     */
    function getFunctionName(path) {
        if (path.node.id) {
            return path.node.id.name;
        }
        if (path.parent.type === 'VariableDeclarator') {
            return path.parent.id.name;
        }
        if (path.parent.type === 'ObjectProperty') {
            return path.parent.key.name;
        }
        return null;
    }
};
