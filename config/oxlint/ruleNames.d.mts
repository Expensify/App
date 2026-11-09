declare const APP_HOSTED_RULE_ESLINT_IDS: Record<string, string>;
declare function oxlintCodeToESLintRuleID(code: string): string;

export {APP_HOSTED_RULE_ESLINT_IDS, oxlintCodeToESLintRuleID};
