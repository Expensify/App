const pathLib = require('path');
const projectRoot = process.cwd();
console.log('⚡ Instrumentation plugin is running!');

module.exports = function ({types: t}) {
    return {
        visitor: {
            Program(path, state) {
                const filename = state.file.opts.filename;
                // Skip node_modules
                if (!filename || filename.includes('node_modules')) {
                    return;
                }

                const init = t.expressionStatement(
                    t.assignmentExpression(
                        '=',
                        t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')),
                        t.logicalExpression('||', t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.newExpression(t.identifier('Map'), [])),
                    ),
                );

                path.node.body.unshift(init);
            },

            Function(path, state) {
                const filename = pathLib.relative(projectRoot, state.file.opts.filename);
                const {node} = path;

                if (!filename || filename.includes('node_modules')) {
                    return;
                }

                if (node._instrumented) {
                    return;
                }
                node._instrumented = true;

                const loc = node.loc?.start || 0;
                const functionName = getFunctionName(path) || 'anonymous';
                const uniqueId = `${filename}:${loc.line}: - ${functionName}`;
                console.log(`[DEBUG] Instrumenting function: ${functionName}`, filename);

                const startTimeId = path.scope.generateUidIdentifier('start');
                const elapsedTimeId = path.scope.generateUidIdentifier('elapsed');

                // Add metrics init (if not yet present for this function)
                const initMetrics = t.expressionStatement(
                    t.callExpression(t.memberExpression(t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.identifier('set')), [
                        t.stringLiteral(uniqueId),
                        t.logicalExpression(
                            '||',
                            t.callExpression(t.memberExpression(t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                t.stringLiteral(uniqueId),
                            ]),
                            t.objectExpression([t.objectProperty(t.identifier('count'), t.numericLiteral(0)), t.objectProperty(t.identifier('time'), t.numericLiteral(0))]),
                        ),
                    ]),
                );

                const startTimer = t.variableDeclaration('const', [
                    t.variableDeclarator(startTimeId, t.callExpression(t.memberExpression(t.identifier('performance'), t.identifier('now')), [])),
                ]);

                const endTimer = t.variableDeclaration('const', [
                    t.variableDeclarator(elapsedTimeId, t.binaryExpression('-', t.callExpression(t.memberExpression(t.identifier('performance'), t.identifier('now')), []), startTimeId)),
                ]);

                const updateMetrics = t.expressionStatement(
                    t.callExpression(t.memberExpression(t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.identifier('set')), [
                        t.stringLiteral(uniqueId),
                        t.objectExpression([
                            t.objectProperty(
                                t.identifier('count'),
                                t.binaryExpression(
                                    '+',
                                    t.memberExpression(
                                        t.callExpression(t.memberExpression(t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                            t.stringLiteral(uniqueId),
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
                                        t.callExpression(t.memberExpression(t.memberExpression(t.identifier('globalThis'), t.identifier('__functionCallMetrics__')), t.identifier('get')), [
                                            t.stringLiteral(uniqueId),
                                        ]),
                                        t.identifier('time'),
                                    ),
                                    elapsedTimeId,
                                ),
                            ),
                        ]),
                    ]),
                );

                // Prepare try/finally wrapper
                const body = path.get('body');

                // Ensure block statement
                if (!body.isBlockStatement()) {
                    body.replaceWith(t.blockStatement([t.returnStatement(body.node)]));
                }

                const originalBody = body.node.body;

                const tryBlock = t.blockStatement(originalBody);
                const finallyBlock = t.blockStatement([endTimer, updateMetrics]);

                body.node.body = [initMetrics, startTimer, t.tryStatement(tryBlock, null, finallyBlock)];
            },
        },
    };

    function getFunctionName(path) {
        if (path.node.id && path.node.id.name) {
            return path.node.id.name;
        }
        const parent = path.parent;
        if (parent.type === 'VariableDeclarator') {
            return parent.id.name;
        }
        if (parent.type === 'ObjectProperty' && parent.key.type === 'Identifier') {
            return parent.key.name;
        }
        if (parent.type === 'ClassMethod' && parent.key.type === 'Identifier') {
            return parent.key.name;
        }
        return null;
    }
};
