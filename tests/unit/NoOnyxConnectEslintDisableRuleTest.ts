type Report = {
    messageId?: string;
};

type Comment = {
    value: string;
    loc: {
        start: {line: number; column: number};
        end: {line: number; column: number};
    };
};

type Visitor = {
    Program?: () => void;
};

type RuleContext = {
    getFilename: () => string;
    getSourceCode: () => {
        getAllComments: () => Comment[];
        lines: string[];
    };
    report: (report: Report) => void;
};

type RuleModule = {
    create: (context: RuleContext) => Visitor;
};

const rule = require('../../eslint-plugin-local-rules/no-onyx-connect-eslint-disable') as RuleModule;

function makeComment(value: string, line: number): Comment {
    return {
        value,
        loc: {
            start: {line, column: 0},
            end: {line, column: value.length},
        },
    };
}

function runRule({filename = '/src/libs/Foo.ts', comments = [], lines = []}: {filename?: string; comments?: Comment[]; lines?: string[]} = {}) {
    const reports: Report[] = [];
    const visitor = rule.create({
        getFilename: () => filename,
        getSourceCode: () => ({
            getAllComments: () => comments,
            lines,
        }),
        report: (report: Report) => reports.push(report),
    });

    visitor.Program?.();

    return reports;
}

describe('no-onyx-connect-eslint-disable', () => {
    it('flags a disable comment that explicitly names the rule, even with a rationale', () => {
        const reports = runRule({
            comments: [makeComment(' eslint-disable-next-line rulesdir/no-onyx-connect -- needed here ', 1)],
            lines: ['// eslint-disable-next-line rulesdir/no-onyx-connect -- needed here', 'Onyx.connect(ONYXKEYS.SESSION, {callback: () => {}});'],
        });

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('noDisable');
    });

    it('flags the unprefixed rule name as well', () => {
        const reports = runRule({comments: [makeComment(' eslint-disable-line no-onyx-connect ', 1)], lines: ['Onyx.connect(ONYXKEYS.SESSION); // eslint-disable-line no-onyx-connect']});

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('noDisable');
    });

    it('flags a blanket eslint-disable-next-line placed above an Onyx.connect() call', () => {
        const reports = runRule({
            comments: [makeComment(' eslint-disable-next-line ', 1)],
            lines: ['// eslint-disable-next-line', 'Onyx.connect(ONYXKEYS.SESSION, {callback: () => {}});'],
        });

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('noDisable');
    });

    it('flags a blanket same-line eslint-disable-line on an Onyx.connect() call', () => {
        const reports = runRule({
            comments: [makeComment(' eslint-disable-line ', 1)],
            lines: ['Onyx.connect(ONYXKEYS.SESSION, {callback: () => {}}); // eslint-disable-line'],
        });

        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.messageId).toBe('noDisable');
    });

    it('does not run inside test files', () => {
        const reports = runRule({
            filename: '/tests/unit/Foo.ts',
            comments: [makeComment(' eslint-disable-next-line rulesdir/no-onyx-connect ', 1)],
            lines: ['// eslint-disable-next-line rulesdir/no-onyx-connect', 'Onyx.connect(ONYXKEYS.SESSION, {callback: () => {}});'],
        });

        expect(reports).toHaveLength(0);
    });

    it('leaves blanket disables that do not neighbor an Onyx.connect() call alone', () => {
        const reports = runRule({
            comments: [makeComment(' eslint-disable-next-line ', 1)],
            lines: ['// eslint-disable-next-line', 'doSomethingElse();'],
        });

        expect(reports).toHaveLength(0);
    });

    it('ignores disable comments that target other named rules', () => {
        const reports = runRule({
            comments: [makeComment(' eslint-disable-next-line rulesdir/no-default-id-values ', 1)],
            lines: ['// eslint-disable-next-line rulesdir/no-default-id-values', 'Onyx.connect(ONYXKEYS.SESSION, {callback: () => {}});'],
        });

        expect(reports).toHaveLength(0);
    });
});
