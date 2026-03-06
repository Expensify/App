import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import useRedirectToExpensifyClassic, {policyMapper} from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.INVOICE;

type InvoiceMenuItemProps = {
    reportID: string;
};

function InvoiceMenuItem({reportID}: InvoiceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['InvoiceGeneric'] as const);
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const [allPolicies] = useMappedPolicies(policyMapper);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);
    const canSendInvoice = canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, sessionEmail);

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={canSendInvoice}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE}
            icon={icons.InvoiceGeneric}
            title={translate('workspace.invoices.sendInvoice')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        showRedirectToExpensifyClassicModal();
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                })
            }
            shouldCallAfterModalHide={shouldRedirectToExpensifyClassic || shouldUseNarrowLayout}
        />
    );
}

export default InvoiceMenuItem;
