/** Integrations whose connector isn't released yet, so the Connections page only offers an account-wide waitlist signup. */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const INTEGRATION_WAITLIST_NVP_KEYS = {
    [CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE]: ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST,
    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: ONYXKEYS.NVP_ODOO_WAITLIST,
} as const;

type WaitlistIntegration = keyof typeof INTEGRATION_WAITLIST_NVP_KEYS;

/** Account field that holds the pending action and errors of a waitlist signup. */
type IntegrationWaitlistField = `${WaitlistIntegration}Waitlist`;

function isWaitlistIntegration(name: string): name is WaitlistIntegration {
    return Object.hasOwn(INTEGRATION_WAITLIST_NVP_KEYS, name);
}

function getIntegrationWaitlistNVPKey(integration: WaitlistIntegration) {
    return INTEGRATION_WAITLIST_NVP_KEYS[integration];
}

function getIntegrationWaitlistField(integration: WaitlistIntegration): IntegrationWaitlistField {
    return `${integration}Waitlist`;
}

export {isWaitlistIntegration, getIntegrationWaitlistNVPKey, getIntegrationWaitlistField};
export type {WaitlistIntegration};
