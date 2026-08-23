/**
 * Linter-agnostic diagnostic produced by an adapter (ESLint today, Oxlint later)
 * and consumed by the post-process pipeline.
 *
 * `severity` matches ESLint: 2 = error, 1 = warning. Seatbelt only ratchets
 * countable errors (severity 2, non-null ruleId).
 */
type LintSeverity = 1 | 2;

type LintMessage = {
    filePath: string;
    ruleId: string | null;
    severity: LintSeverity;
    message: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    suggestions?: unknown;
    fix?: unknown;
};

type LintFileResult = {
    filePath: string;
    messages: LintMessage[];
    source?: string;
};

type RawLintOutput = {
    results: LintFileResult[];
    /** Non-zero when the linter itself crashed or rejected the config. */
    linterExitCode: number;
    /** Stderr from the linter process, for surfacing crashes. */
    stderr: string;
};

type SeatbeltRuleSet = 'all' | Set<string>;

type SeatbeltOptions = {
    seatbeltFile: string;
    projectRoot: string;
    disable: boolean;
    frozen: boolean;
    readOnly: boolean;
    allowIncreaseRules: SeatbeltRuleSet;
    keepRules: SeatbeltRuleSet;
    quiet: boolean;
    verbose: boolean;
};

export type {LintFileResult, LintMessage, LintSeverity, RawLintOutput, SeatbeltOptions, SeatbeltRuleSet};
