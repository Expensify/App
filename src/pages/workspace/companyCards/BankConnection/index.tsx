import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PendingBank} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {checkIfNewFeedConnected, getBankName, isSelectedFeedExpired} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSelectedFeed} from '@userActions/Card';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {getCompanyCardBankConnection, getCompanyCardPlaidConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import openBankConnection from './openBankConnection';

let customWindow: Window | null = null;

type BankConnectionProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed for assign card flow */
    feed?: CompanyCardFeed;

    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;
};

function BankConnection({policyID: policyIDFromProps, feed, route}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const {bankName: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const [cardFeeds] = useCardFeeds(policyID);
    const prevFeedsData = usePrevious(cardFeeds?.settings?.oAuthAccountDetails);
    const [shouldBlockWindowOpen, setShouldBlockWindowOpen] = useState(false);
    const selectedBank = addNewCard?.data?.selectedBank;
    const bankName = feed ? getBankName(feed) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds?.settings?.oAuthAccountDetails ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds?.settings?.oAuthAccountDetails, prevFeedsData],
    );
    const {isOffline} = useNetwork();
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.data?.plaidAccessToken;
    const plaidFeed = addNewCard?.data?.plaidConnectedFeed ?? assignCard?.data?.institutionId;
    const plaidFeedName = addNewCard?.data?.plaidConnectedFeedName ?? assignCard?.data?.plaidConnectedFeedName;
    const {isBetaEnabled} = usePermissions();

    const url =
        isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && plaidToken
            ? getCompanyCardPlaidConnection(policyID, plaidToken, plaidFeed, plaidFeedName)
            : getCompanyCardBankConnection(policyID, bankName);
    const isFeedExpired = feed ? isSelectedFeedExpired(cardFeeds?.settings?.oAuthAccountDetails?.[feed]) : false;
    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate('workspace.companyCards.assignCard') : headerTitleAddCards;

    const onOpenBankConnectionFlow = useCallback(() => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    }, [url]);

    const handleBackButtonPress = () => {
        customWindow?.close();

        // Handle assign card flow
        if (feed) {
            Navigation.goBack();
            return;
        }

        // Handle add new card flow
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX || isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
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
            {bankName &&
                translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, {
                    bankName: addNewCard?.data?.plaidConnectedFeedName ?? bankName,
                })}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>
        </Text>
    );

    useEffect(() => {
        if (!url || isOffline) {
            return;
        }

        // Handle assign card flow
        if (feed) {
            if (!isFeedExpired) {
                customWindow?.close();
                setAssignCardStepAndData({
                    currentStep: assignCard?.data?.dateOption ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
                return;
            }
            customWindow = openBankConnection(url);
            return;
        }

        // Handle add new card flow
        if (isNewFeedConnected) {
            setShouldBlockWindowOpen(true);
            customWindow?.close();
            if (newFeed) {
                updateSelectedFeed(newFeed, policyID);
            }
            Navigation.closeRHPFlow();
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            return;
        }
        if (!shouldBlockWindowOpen) {
            customWindow = openBankConnection(url);
        }
    }, [isNewFeedConnected, shouldBlockWindowOpen, newFeed, policyID, url, feed, isFeedExpired, isOffline, assignCard]);

    return (
        <ScreenWrapper
            testID={BankConnection.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <BlockingView
                    icon={PendingBank}
                    iconWidth={styles.pendingBankCardIllustration.width}
                    iconHeight={styles.pendingBankCardIllustration.height}
                    title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                    linkKey="workspace.moreFeatures.companyCards.pendingBankLink"
                    CustomSubtitle={CustomSubtitle}
                    shouldShowLink
                    onLinkPress={onOpenBankConnectionFlow}
                    addBottomSafeAreaPadding
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
