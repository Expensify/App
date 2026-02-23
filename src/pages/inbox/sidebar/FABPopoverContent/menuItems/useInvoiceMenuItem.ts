import type {OnyxCollection} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type UseInvoiceMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function useInvoiceMenuItem({shouldUseNarrowLayout, icons, reportID}: UseInvoiceMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});

    const canSendInvoice = canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email);

    if (!canSendInvoice) {
        return [];
    }
    return [
        {
            icon: icons.InvoiceGeneric,
            text: translate('workspace.invoices.sendInvoice'),
            shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
            onSelected: () =>
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        showRedirectToExpensifyClassicModal();
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                }),
            sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE,
        },
    ];
}

export default useInvoiceMenuItem;
