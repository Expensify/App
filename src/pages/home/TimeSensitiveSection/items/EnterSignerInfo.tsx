import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';

import ROUTES from '@src/ROUTES';

import React from 'react';

type EnterSignerInfoProps = {
    /** The policy ID that owns the bank account requiring signer info */
    policyID: string;

    /** The bank account ID requiring signer info */
    bankAccountID: string;

    /** Last four digits of the bank account number */
    bankAccountLastFour: string;
};

function EnterSignerInfo({policyID, bankAccountID, bankAccountLastFour}: EnterSignerInfoProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    const handleCtaPress = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_ENTER_SIGNER_INFO.getRoute(policyID, bankAccountID, false));
    };

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            iconBackgroundColor={colors.green100}
            iconFill={colors.green500}
            title={translate('homePage.timeSensitiveSection.enterSignerInfo.title')}
            subtitle={translate('homePage.timeSensitiveSection.enterSignerInfo.subtitle', {bankAccountLastFour})}
            ctaText={translate('homePage.forYouSection.begin')}
            onCtaPress={handleCtaPress}
            buttonProps={{success: true}}
        />
    );
}

export default EnterSignerInfo;
