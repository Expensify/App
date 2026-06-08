type Report = {
    messageId?: string;
};

type RuleContext = {
    report: (report: Report) => void;
};

type RuleModule = {
    create: (context: RuleContext) => {
        JSXOpeningElement: (node: {type: 'JSXOpeningElement'; attributes: JSXAttribute[]}) => void;
    };
};

type JSXAttribute = {
    type: 'JSXAttribute';
    name: {name: string};
    value?:
        | {
              type: 'Literal';
              value: string;
          }
        | {
              type: 'JSXExpressionContainer';
              expression: Record<string, unknown>;
          };
};

const rule = require('../../eslint-plugin-local-rules/require-live-region-for-status-updates') as RuleModule;

function createLiteralAttribute(name: string, value: string): JSXAttribute {
    return {
        type: 'JSXAttribute',
        name: {name},
        value: {type: 'Literal', value},
    };
}

function createConstRoleExpression(roleName: string) {
    return {
        type: 'MemberExpression',
        computed: false,
        object: {
            type: 'MemberExpression',
            computed: false,
            object: {type: 'Identifier', name: 'CONST'},
            property: {type: 'Identifier', name: 'ROLE'},
        },
        property: {type: 'Identifier', name: roleName},
    };
}

function createConditionalRoleAttribute(name: string, roleName: string): JSXAttribute {
    return {
        type: 'JSXAttribute',
        name: {name},
        value: {
            type: 'JSXExpressionContainer',
            expression: {
                type: 'ConditionalExpression',
                test: {type: 'Identifier', name: 'condition'},
                consequent: createConstRoleExpression(roleName),
                alternate: {type: 'Identifier', name: 'undefined'},
            },
        },
    };
}

function createExpressionStringAttribute(name: string, value: string): JSXAttribute {
    return {
        type: 'JSXAttribute',
        name: {name},
        value: {
            type: 'JSXExpressionContainer',
            expression: {type: 'Literal', value},
        },
    };
}

function runRule(attributes: JSXAttribute[]) {
    const reports: Report[] = [];
    const visitor = rule.create({
        report: (report: Report) => reports.push(report),
    });

    visitor.JSXOpeningElement({
        type: 'JSXOpeningElement',
        attributes,
    });

    return reports;
}

describe('require-live-region-for-status-updates', () => {
    it('fails when accessibilityLiveRegion is used without any role', () => {
        const reports = runRule([createLiteralAttribute('accessibilityLiveRegion', 'polite')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('missingStatusRole');
    });

    it('fails when accessibilityLiveRegion is used with an explicit non-status role', () => {
        const reports = runRule([createLiteralAttribute('role', 'button'), createLiteralAttribute('accessibilityLiveRegion', 'polite')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('missingStatusRole');
    });

    it('fails when a conditional alert role is missing a live region', () => {
        const reports = runRule([createConditionalRoleAttribute('accessibilityRole', 'ALERT')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('missingLiveRegion');
    });

    it('fails when a conditional status role is missing a live region', () => {
        const reports = runRule([createConditionalRoleAttribute('role', 'STATUS')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('missingLiveRegion');
    });

    it('passes when a conditional alert role has a valid live region', () => {
        const reports = runRule([createConditionalRoleAttribute('accessibilityRole', 'ALERT'), createExpressionStringAttribute('accessibilityLiveRegion', 'assertive')]);

        expect(reports).toHaveLength(0);
    });

    it('fails when alert or status uses accessibilityLiveRegion="none"', () => {
        const reports = runRule([createLiteralAttribute('role', 'status'), createLiteralAttribute('accessibilityLiveRegion', 'none')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('invalidLiveRegion');
    });

    it('fails when a conditional status role uses accessibilityLiveRegion="none"', () => {
        const reports = runRule([createConditionalRoleAttribute('accessibilityRole', 'ALERT'), createLiteralAttribute('accessibilityLiveRegion', 'none')]);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('invalidLiveRegion');
    });
});
