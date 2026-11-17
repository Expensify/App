/**
 * The host that serves both New Expensify and Expensify Classic for each build environment. The build config reads this module to define
 * `__SHARED_PRODUCT_HOST__`, so it must not import app code.
 */
const SHARED_PRODUCT_HOSTS: Record<string, string> = {
    development: 'expensify.com.dev',
    staging: 'staging.expensify.com',
    qa: 'qa.exops.io',
    production: 'expensify.com',
    adhoc: 'staging.expensify.com',
};

function getSharedProductHostForEnvironment(environment: string): string | undefined {
    return SHARED_PRODUCT_HOSTS[environment];
}

export default getSharedProductHostForEnvironment;
