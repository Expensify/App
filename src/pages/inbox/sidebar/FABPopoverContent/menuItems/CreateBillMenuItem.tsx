/** Opens the manual Bill Pay intake form from global create. */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function CreateBillMenuItem() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['InvoiceGeneric']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <FABFocusableMenuItem
            itemId={CONST.FAB_MENU_ITEM_IDS.CREATE_BILL}
            isVisible
            icon={icons.InvoiceGeneric}
            title={translate('billPay.createBill')}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.CREATE_BILL))}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default CreateBillMenuItem;
