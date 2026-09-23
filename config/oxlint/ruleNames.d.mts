declare const OXLINT_RULE_RENAMES: Record<string, string>;
declare const HOSTED_RULE_ORIGIN: Record<string, string>;
declare function hostedRuleNames(eslintPrefix: string): string[];
declare function oxlintCodeToESLintRuleID(code: string): string;

export {HOSTED_RULE_ORIGIN, OXLINT_RULE_RENAMES, hostedRuleNames, oxlintCodeToESLintRuleID};
