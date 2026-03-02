/**
 * Multifactor authentication scenario names.
 *
 * The names need to be a kebab-case string to satisfy the requirements of the URL schema.
 * Moreover, they are exported to a separate file to avoid circular dependencies
 * as the Multifactor Authentication configs imports SCREENS, actions, and other shared modules,
 * and at the same time the config is imported in the CONSTs.
 */
const SCENARIO_NAMES = {
    BIOMETRICS_TEST: 'BIOMETRICS-TEST',
    AUTHORIZE_TRANSACTION: 'AUTHORIZE-TRANSACTION',
} as const;

/**
 * Prompt identifiers for multifactor authentication scenarios.
 */
const PROMPT_NAMES = {
    ENABLE_BIOMETRICS: 'enable-biometrics',
};

export {SCENARIO_NAMES, PROMPT_NAMES};
