/**
 * ESLint plugin that enforces architectural constraints on ReportNameUtils.ts.
 *
 * `getReportName` must remain a pure read-only function — it reads from
 * pre-computed `reportAttributesDerivedValue` and must never call other
 * functions. All computation belongs in `computeReportName`.
 */

const noFunctionCallInGetReportName = {
    meta: {
        type: 'problem',
        docs: {description: 'getReportName must be a pure read-only function. Move any computation to computeReportName instead.'},
        messages: {noFunctionCall: 'getReportName must be a pure read-only function. Move any computation to computeReportName instead.'},
        schema: [],
    },
    create(context) {
        return {
            'FunctionDeclaration[id.name="getReportName"] CallExpression': function (node) {
                context.report({node, messageId: 'noFunctionCall'});
            },
        };
    },
};

export default {
    meta: {name: 'eslint-plugin-report-name-utils'},
    rules: {
        'no-function-call-in-get-report-name': noFunctionCallInGetReportName,
    },
};
