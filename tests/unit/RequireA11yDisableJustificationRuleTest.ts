type Report = {
    messageId?: string;
};

type RuleContext = {
    getSourceCode: () => {
        getAllComments: () => Comment[];
    };
    report: (report: Report) => void;
};

type RuleModule = {
    create: (context: RuleContext) => {
        Program: () => void;
    };
};

type Comment = {
    value: string;
    loc: {
        start: {line: number; column: number};
        end: {line: number; column: number};
    };
};

const rule = require('../../eslint-plugin-local-rules/require-a11y-disable-justification') as RuleModule;

function createComment(value: string): Comment {
    return {
        value,
        loc: {
            start: {line: 1, column: 0},
            end: {line: 1, column: value.length},
        },
    };
}

function runRule(commentValues: string[]) {
    const reports: Report[] = [];
    const visitor = rule.create({
        getSourceCode: () => ({
            getAllComments: () => commentValues.map(createComment),
        }),
        report: (report: Report) => reports.push(report),
    });

    visitor.Program();

    return reports;
}

describe('require-a11y-disable-justification', () => {
    it('passes when the disable comment has both rationale and issue link', () => {
        const reports = runRule([' eslint-disable react-native-a11y/foo -- false positive in wrapper. https://github.com/Expensify/App/issues/123 ']);

        expect(reports).toHaveLength(0);
    });

    it('passes when the disable comment has only a rationale', () => {
        const reports = runRule([' eslint-disable react-native-a11y/foo -- false positive in wrapper ']);

        expect(reports).toHaveLength(0);
    });

    it('passes when the disable comment has only a tracking issue link', () => {
        const reports = runRule([' eslint-disable react-native-a11y/foo -- https://github.com/Expensify/App/issues/123 ']);

        expect(reports).toHaveLength(0);
    });

    it('fails when the disable comment has neither rationale nor issue link', () => {
        const reports = runRule([' eslint-disable react-native-a11y/foo ']);

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('missingIssueOrRationale');
    });

    it('passes for multiline block comments after normalization', () => {
        const reports = runRule(['*\n * eslint-disable react-native-a11y/foo\n * -- false positive in wrapper.\n * https://github.com/Expensify/App/issues/123\n ']);

        expect(reports).toHaveLength(0);
    });

    it('passes for eslint-disable-next-line comments', () => {
        const reports = runRule([' eslint-disable-next-line react-native-a11y/foo -- false positive in wrapper. https://github.com/Expensify/App/issues/123 ']);

        expect(reports).toHaveLength(0);
    });

    it('passes for eslint-disable-line comments', () => {
        const reports = runRule([' eslint-disable-line react-native-a11y/foo -- false positive in wrapper. https://github.com/Expensify/App/issues/123 ']);

        expect(reports).toHaveLength(0);
    });

    it('ignores non-react-native-a11y disable comments', () => {
        const reports = runRule([' eslint-disable no-console ']);

        expect(reports).toHaveLength(0);
    });
});
