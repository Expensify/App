import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type InvoiceMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function InvoiceMenuItem({shouldUseNarrowLayout, icons, reportID}: InvoiceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});

    const canSendInvoice = canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email);

    if (!canSendInvoice) {
        return null;
    }

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE}
            icon={icons.InvoiceGeneric}
            text={translate('workspace.invoices.sendInvoice')}
            shouldCallAfterModalHide={shouldRedirectToExpensifyClassic || shouldUseNarrowLayout}
            onSelected={() =>
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        showRedirectToExpensifyClassicModal();
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE}
        />
    );
}

export default InvoiceMenuItem;
