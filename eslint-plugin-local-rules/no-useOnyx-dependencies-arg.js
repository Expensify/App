const name = 'no-useOnyx-dependencies-arg';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow the deprecated 3rd `dependencies` argument of useOnyx(). React Compiler memoizes selectors; keep the selector reference stable instead.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noDependenciesArg:
            'The 3rd `dependencies` argument of useOnyx() is deprecated and being removed (https://github.com/Expensify/App/issues/94595).\n\n' +
            'Do not pass a dependency array. Keep the selector reference stable instead:\n' +
            '- Prefer an inline or module-level selector (React Compiler memoizes it automatically).\n' +
            '- In React-Compiler-bailout files, wrap the selector in useCallback with the relevant dependencies.',
    },
};

/**
 * Flags any `useOnyx(key, options, dependencies)` call that still passes the deprecated
 * 3rd `dependencies` argument. Matches the `useOnyx` identifier regardless of import source
 * (both `@hooks/useOnyx` and the restricted `react-native-onyx` import).
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    return {
        CallExpression(node) {
            if (node.callee.type !== 'Identifier' || node.callee.name !== 'useOnyx') {
                return;
            }

            if (node.arguments.length < 3) {
                return;
            }

            context.report({
                node: node.arguments[2],
                messageId: 'noDependenciesArg',
            });
        },
    };
}

export {name, meta, create};
