import React, {useLayoutEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startMoneyRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {canSendInvoice as canSendInvoicePolicyUtils} from '@libs/PolicyUtils';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = 'invoice';

type InvoiceMenuItemProps = {
    reportID: string;
};

function InvoiceMenuItem({reportID}: InvoiceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['InvoiceGeneric'] as const);
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies} = useRedirectToExpensifyClassic();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {focusedIndex, setFocusedIndex, onItemPress, registeredItems, registerItem, unregisterItem} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const canSendInvoice = canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email);

    useLayoutEffect(() => {
        if (!canSendInvoice) {
            return;
        }
        registerItem(ITEM_ID);
        return () => unregisterItem(ITEM_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSendInvoice]);

    const itemIndex = registeredItems.indexOf(ITEM_ID);

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

export default InvoiceMenuItem;
