/**
 * Adapted from https://github.com/Shopify/web-configs/blob/84c180fb08968276198faade21fa6918b104804c/packages/eslint-plugin/lib/rules/prefer-early-return.js#L1-L78
 */
const defaultMaximumStatements = 0;
const message = 'Prefer an early return to a conditionally-wrapped function body';

module.exports = {
    message,
    rule: {
        create(context) {
            const options = context.options[0] || {
                maximumStatements: defaultMaximumStatements,
            };
            const maxStatements = options.maximumStatements;

            function isLonelyIfStatement(statement) {
                return statement.type === 'IfStatement' && statement.alternate == null;
            }

            function isOffendingConsequent(consequent) {
                return (
                    (consequent.type === 'ExpressionStatement' && maxStatements === 0)
                        || (consequent.type === 'BlockStatement'
                        && consequent.body.length > maxStatements)
                );
            }

            function isOffendingIfStatement(statement) {
                return (
                    isLonelyIfStatement(statement)
                        && isOffendingConsequent(statement.consequent)
                );
            }

            function hasSimplifiableConditionalBody(functionBody) {
                const body = functionBody.body;
                return (
                    functionBody.type === 'BlockStatement'
                        && body.length === 1
                        && isOffendingIfStatement(body[0])
                );
            }

            function checkFunctionBody(functionNode) {
                const body = functionNode.body;

                if (hasSimplifiableConditionalBody(body)) {
                    context.report(
                        body,
                        message,
                    );
                }
            }

            return {
                FunctionDeclaration: checkFunctionBody,
                FunctionExpression: checkFunctionBody,
                ArrowFunctionExpression: checkFunctionBody,
            };
        },
    },
};
