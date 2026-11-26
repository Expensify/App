/**
 * These integrations are set up outside Expensify and must not share backend receipt-partner connection state.
 */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type ReceiptIntegrationGuide = {
    key: string;
    titleKey: TranslationPaths;
    iconName: ExpensifyIconName;
    helpURL: string;
};

const RECEIPT_INTEGRATION_GUIDES = [
    {key: 'lyft', titleKey: 'workspace.receiptPartners.lyft.title', iconName: 'Lyft', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.LYFT},
    {key: 'instacart', titleKey: 'workspace.receiptPartners.instacart.title', iconName: 'Instacart', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.INSTACART},
    {key: 'doordash', titleKey: 'workspace.receiptPartners.doordash.title', iconName: 'DoorDash', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.DOORDASH},
    {key: 'americanAirlines', titleKey: 'workspace.receiptPartners.americanAirlines.title', iconName: 'AmericanAirlines', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.AMERICAN_AIRLINES},
    {key: 'united', titleKey: 'workspace.receiptPartners.united.title', iconName: 'United', helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.UNITED},
    {
        key: 'delta',
        titleKey: 'workspace.receiptPartners.delta.title',
        iconName: 'Delta',
        helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.DELTA,
    },
    {
        key: 'kayak',
        titleKey: 'workspace.receiptPartners.kayak.title',
        iconName: 'Kayak',
        helpURL: CONST.RECEIPT_INTEGRATION_HELP_URLS.KAYAK,
    },
] as const satisfies readonly ReceiptIntegrationGuide[];

export default RECEIPT_INTEGRATION_GUIDES;
