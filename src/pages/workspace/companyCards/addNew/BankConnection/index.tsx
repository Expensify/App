import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {checkIfNewFeedConnected} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getWorkspaceAccountID} from '@libs/PolicyUtils';
import {updateSelectedFeed} from '@userActions/Card';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const prevFeedsData = usePrevious(cardFeeds?.settings?.oAuthAccountDetails);
    const {isNewFeedConnected, newFeed} = useMemo(() => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds?.settings?.oAuthAccountDetails ?? {}), [cardFeeds, prevFeedsData]);
    const {isOffline} = useNetwork();

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
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.AMEX) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED});
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    const CustomSubtitle = (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, {bankName})}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>
        </Text>
    );

    useEffect(() => {
        if (!url || isOffline) {
            return;
        }
        if (isNewFeedConnected) {
            customWindow?.close();
            if (newFeed) {
                updateSelectedFeed(newFeed, policyID);
            }
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            return;
        }
        customWindow = openBankConnection(url);
    }, [isNewFeedConnected, isOffline, newFeed, policyID, url]);

    return (
        <ScreenWrapper testID={BankConnection.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView>
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
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
