/**
 * These integrations are set up outside Expensify and must not share backend receipt-partner connection state.
 */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import CONST from '@src/CONST';

type ReceiptIntegrationGuide = {
    key: string;
    title: string;
    iconName: ExpensifyIconName;
    helpURL: string;
};

const RECEIPT_INTEGRATION_GUIDES = [
    {key: 'lyft', title: 'Lyft', iconName: 'Lyft', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.LYFT},
    {key: 'instacart', title: 'Instacart', iconName: 'Instacart', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.INSTACART},
    {key: 'doordash', title: 'DoorDash', iconName: 'DoorDash', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.DOORDASH},
    {key: 'americanAirlines', title: 'American Airlines', iconName: 'AmericanAirlines', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.AMERICAN_AIRLINES},
    {key: 'united', title: 'United', iconName: 'United', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.UNITED},
    {
        key: 'delta',
        title: 'Delta',
        iconName: 'Delta',
        helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.DELTA,
    },
    {
        key: 'kayak',
        title: 'KAYAK',
        iconName: 'Kayak',
        helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.KAYAK,
    },
] as const satisfies readonly ReceiptIntegrationGuide[];

export default RECEIPT_INTEGRATION_GUIDES;
