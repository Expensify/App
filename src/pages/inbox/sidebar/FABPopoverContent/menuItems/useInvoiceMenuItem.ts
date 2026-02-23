import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseInvoiceMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
    allTransactionDrafts: OnyxCollection<OnyxTypes.Transaction>;
};

function useInvoiceMenuItem({shouldUseNarrowLayout, icons, reportID, allTransactionDrafts}: UseInvoiceMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const canSendInvoice = useMemo(() => canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email), [allPolicies, session?.email]);

    return useMemo(() => {
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
    }, [canSendInvoice, icons.InvoiceGeneric, translate, shouldRedirectToExpensifyClassic, shouldUseNarrowLayout, showRedirectToExpensifyClassicModal, reportID, allTransactionDrafts]);
}

export default useInvoiceMenuItem;
