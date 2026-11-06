import type {OxlintConfig} from 'oxlint';

type AppConfig = Pick<OxlintConfig, 'ignorePatterns' | 'env' | 'globals' | 'settings' | 'jsPlugins' | 'overrides'>;

declare const ESLINT_RULE_RENAMES: Record<string, string>;
declare const LOCAL_HOSTED_RULES: Record<string, string>;
declare const STUBBED_PARSER_SERVICES: Set<string>;
declare const coreRuleNames: string[];
declare const hostedRuleIDs: string[];
declare function extendOxlintConfig(appConfig: AppConfig): OxlintConfig;
declare function getPluginRules(prefix: string): Record<string, unknown>;
declare function splitRuleID(ruleID: string): {prefix: string; name: string};

export {ESLINT_RULE_RENAMES, LOCAL_HOSTED_RULES, STUBBED_PARSER_SERVICES, coreRuleNames, extendOxlintConfig, getPluginRules, hostedRuleIDs, splitRuleID};
