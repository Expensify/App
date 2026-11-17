import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import openHomeAddressPage from '@libs/Navigation/helpers/openHomeAddressPage';

import CONST from '@src/CONST';

import React from 'react';

function AddHomeAddress() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Home']);

    return (
        <BaseWidgetItem
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM.ADD_HOME_ADDRESS}
            buttonSentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM_BUTTON.ADD_HOME_ADDRESS}
            icon={icons.Home}
            title={translate('homePage.timeSensitiveSection.addHomeAddress.title')}
            subtitle={translate('homePage.timeSensitiveSection.addHomeAddress.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addHomeAddress.cta')}
            onCtaPress={openHomeAddressPage}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddHomeAddress;
