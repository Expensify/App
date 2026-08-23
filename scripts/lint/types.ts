/**
 * Linter-agnostic diagnostic produced by a Linter (ESLint today, Oxlint later)
 * and consumed by processors and the formatter.
 *
 * `severity` matches ESLint: 2 = error, 1 = warning. Seatbelt only ratchets
 * countable errors (severity 2, non-null ruleID).
 */
type LintSeverity = 1 | 2;

type LintMessage = {
    filePath: string;
    ruleID: string | null;
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

type LinterResult = {
    files: LintFileResult[];
    /** Non-zero when the linter itself crashed or rejected the config. */
    exitCode: number;
    /** Stderr from the linter process, for surfacing crashes. */
    stderr: string;
};

type ProcessorContext = {
    projectRoot: string;
    lintedFiles: string[];
};

type FormatterResult = {
    text: string;
    errorCount: number;
    warningCount: number;
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

export type {FormatterResult, LintFileResult, LintMessage, LintSeverity, LinterResult, ProcessorContext, SeatbeltOptions, SeatbeltRuleSet};
