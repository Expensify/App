import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type EnterSignerInfoProps = {
    /** The policy ID that owns the bank account requiring signer info */
    policyID: string;

    /** The bank account ID requiring signer info */
    bankAccountID: string;
};

function EnterSignerInfo({policyID, bankAccountID}: EnterSignerInfoProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    const handleCtaPress = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_ENTER_SIGNER_INFO.getRoute(policyID, bankAccountID, false));
    };

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={translate('homePage.timeSensitiveSection.enterSignerInfo.title')}
            ctaText={translate('homePage.forYouSection.begin')}
            onCtaPress={handleCtaPress}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default EnterSignerInfo;
