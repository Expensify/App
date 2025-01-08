import React, {useCallback, useEffect} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import getCurrentUrl from '@navigation/currentUrl';
import * as CompanyCards from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
import openBankConnection from './openBankConnection';

let customWindow: Window | null = null;

type BankConnectionStepProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed */
    feed: CompanyCardFeed;
};

function BankConnection({policyID, feed}: BankConnectionStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const bankName = CardUtils.getBankName(feed);
    const currentUrl = getCurrentUrl();
    const isBankConnectionCompleteRoute = currentUrl.includes(ROUTES.BANK_CONNECTION_COMPLETE);
    const url = getCompanyCardBankConnection(policyID, bankName);

    const onOpenBankConnectionFlow = useCallback(() => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    }, [url]);

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    const CustomSubtitle = (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, {bankName})}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>
        </Text>
    );

    useEffect(() => {
        if (!url) {
            return;
        }
        if (isBankConnectionCompleteRoute) {
            customWindow?.close();
            CompanyCards.setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                isEditing: false,
            });
            return;
        }
        customWindow = openBankConnection(url);
    }, [isBankConnectionCompleteRoute, policyID, url]);

    return (
        <ScreenWrapper testID={BankConnection.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.companyCards.assignCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <BlockingView
                icon={Illustrations.PendingBank}
                iconWidth={styles.pendingBankCardIllustration.width}
                iconHeight={styles.pendingBankCardIllustration.height}
                title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                linkKey="workspace.moreFeatures.companyCards.pendingBankLink"
                CustomSubtitle={CustomSubtitle}
                shouldShowLink
                onLinkPress={onOpenBankConnectionFlow}
            />
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
