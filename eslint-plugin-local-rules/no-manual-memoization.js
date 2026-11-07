const name = 'no-manual-memoization';

const REACT_NAVIGATION_MODULES = ['@react-navigation/native', '@react-navigation/core'];

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow manual memoization when React Compiler memoizes the file.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        redundant: 'React Compiler memoizes this file. Remove {{method}} and derive values directly in render instead. useCallback is only allowed for useFocusEffect callbacks.',
    },
};

/** @param {import('eslint').Rule.RuleContext} context */
function create(context) {
    const {sourceCode} = context;

    function findVariable(node) {
        let scope = sourceCode.getScope(node);
        while (scope) {
            const variable = scope.set.get(node.name);
            if (variable) {
                return variable;
            }
            scope = scope.upper;
        }
        return undefined;
    }

    function importedMethod(node, moduleName) {
        if (node.type === 'Identifier') {
            const definition = findVariable(node)?.defs[0];
            if (definition?.type !== 'ImportBinding' || definition.parent.source.value !== moduleName || definition.node.type !== 'ImportSpecifier') {
                return undefined;
            }
            return definition.node.imported.name ?? definition.node.imported.value;
        }
        if (node.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return undefined;
        }
        const definition = findVariable(node.object)?.defs[0];
        if (definition?.type !== 'ImportBinding' || definition.parent.source.value !== moduleName || definition.node.type === 'ImportSpecifier') {
            return undefined;
        }
        return node.computed ? node.property.value : node.property.name;
    }

    function isFocusEffectArgument(node) {
        return (
            node.parent.type === 'CallExpression' &&
            node.parent.arguments[0] === node &&
            REACT_NAVIGATION_MODULES.some((moduleName) => importedMethod(node.parent.callee, moduleName) === 'useFocusEffect')
        );
    }

    function isFocusCallback(node) {
        if (isFocusEffectArgument(node)) {
            return true;
        }
        if (node.parent.type !== 'VariableDeclarator' || node.parent.id.type !== 'Identifier') {
            return false;
        }
        return sourceCode.getDeclaredVariables(node.parent).some((variable) => variable.references.some((reference) => reference.isRead() && isFocusEffectArgument(reference.identifier)));
    }

    return {
        CallExpression(node) {
            const method = importedMethod(node.callee, 'react');
            if (!['memo', 'useMemo', 'useCallback'].includes(method) || (method === 'useCallback' && isFocusCallback(node))) {
                return;
            }
            context.report({node, messageId: 'redundant', data: {method}});
        },
    };
}

export {name, meta, create};
