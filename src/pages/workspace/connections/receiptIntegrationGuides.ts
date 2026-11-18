/**
 * These integrations are set up outside Expensify and must not share backend receipt-partner connection state.
 */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

type ReceiptIntegrationGuide = {
    key: string;
    title: string;
    iconName: ExpensifyIconName;
    helpURL: string;
};

// The example.com destinations are draft-only placeholders approved in https://github.com/Expensify/App/issues/106094.
const RECEIPT_INTEGRATION_GUIDES = [
    {key: 'lyft', title: 'Lyft', iconName: 'Lyft', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Lyft'},
    {key: 'instacart', title: 'Instacart', iconName: 'Instacart', helpURL: 'https://example.com/expensify-help/instacart'},
    {key: 'doordash', title: 'DoorDash', iconName: 'DoorDash', helpURL: 'https://example.com/expensify-help/doordash'},
    {key: 'americanAirlines', title: 'American Airlines', iconName: 'AmericanAirlines', helpURL: 'https://example.com/expensify-help/american-airlines'},
    {key: 'united', title: 'United', iconName: 'United', helpURL: 'https://example.com/expensify-help/united'},
    {
        key: 'delta',
        title: 'Delta',
        iconName: 'Delta',
        helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Travel-receipt-integrations#delta-for-business',
    },
    {
        key: 'kayak',
        title: 'KAYAK',
        iconName: 'Kayak',
        helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Travel-receipt-integrations#kayak-for-business',
    },
] as const satisfies readonly ReceiptIntegrationGuide[];

export default RECEIPT_INTEGRATION_GUIDES;
