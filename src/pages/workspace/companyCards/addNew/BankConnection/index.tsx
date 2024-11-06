import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import getCurrentUrl from '@navigation/currentUrl';
import * as CompanyCards from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import openBankConnection from './openBankConnection';

let customWindow: Window | null = null;

type BankConnectionStepProps = {
    policyID?: string;
};

function BankConnection({policyID}: BankConnectionStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const bankName: ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | undefined = addNewCard?.data?.selectedBank;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID ?? '-1');
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const bankKey = Object.keys(CONST.COMPANY_CARDS.BANKS).find((value) => CONST.COMPANY_CARDS.BANKS[value] === bankName);
    const feedName = bankKey ? CONST.COMPANY_CARD.FEED_BANK_NAME?.[bankKey] : undefined;
    const connectedBank = feedName ? cardFeeds?.settings?.oAuthAccountDetails?.[feedName] : undefined;

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
        customWindow?.close();
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.AMEX) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED});
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
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
        if (connectedBank && !isEmptyObject(connectedBank) && customWindow) {
            customWindow?.close();
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID ?? '-1'));
            return;
        }
        if (isBankConnectionCompleteRoute) {
            customWindow?.close();
            return;
        }
        customWindow = openBankConnection(url);
    }, [connectedBank, isBankConnectionCompleteRoute, policyID, url]);

    return (
        <ScreenWrapper testID={BankConnection.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
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
