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

const RECEIPT_INTEGRATION_GUIDES = [
    {key: 'lyft', title: 'Lyft', iconName: 'Lyft', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Lyft'},
    {key: 'instacart', title: 'Instacart', iconName: 'Instacart', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Instacart'},
    {key: 'doordash', title: 'DoorDash', iconName: 'DoorDash', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/DoorDash'},
    {key: 'americanAirlines', title: 'American Airlines', iconName: 'AmericanAirlines', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/American-Airlines'},
    {key: 'united', title: 'United', iconName: 'United', helpURL: 'https://help.expensify.com/articles/new-expensify/connections/United-Airlines'},
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
