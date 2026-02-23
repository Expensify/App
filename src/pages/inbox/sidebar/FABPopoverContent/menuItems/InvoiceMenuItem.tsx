import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type InvoiceMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
    /** Injected by FABPopoverMenu via React.cloneElement */
    itemIndex?: number;
};

function useInvoiceMenuItemVisible(): boolean {
    const {allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    return canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email);
}

function InvoiceMenuItem({shouldUseNarrowLayout, icons, reportID, itemIndex = -1}: InvoiceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const canSendInvoice = canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email);

    if (!canSendInvoice) {
        return null;
    }

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE}
            icon={icons.InvoiceGeneric}
            title={translate('workspace.invoices.sendInvoice')}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() =>
                onItemPress(
                    () =>
                        interceptAnonymousUser(() => {
                            if (shouldRedirectToExpensifyClassic) {
                                showRedirectToExpensifyClassicModal();
                                return;
                            }
                            startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                        }),
                    {shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout},
                )
            }
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export {useInvoiceMenuItemVisible};
export default InvoiceMenuItem;
