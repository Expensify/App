import React, {useCallback, useEffect, useState} from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useImportPersonalPlaidAccounts from '@hooks/useImportPersonalPlaidAccounts';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import PersonalCardsErrorConfirmation from '@pages/settings/Wallet/PersonalCards/PersonalCardsErrorConfirmation';
import useGetNewPersonalCard from '@pages/settings/Wallet/PersonalCards/useGetNewPersonalCard';
import {getPersonalCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import {setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import openBankConnection from './openBankConnection';

let customWindow: Window | null = null;

type BankConnectionProps = {
    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_BANK_CONNECTION>;
};

function BankConnection({route}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const {feed: bankNameFromRoute} = route?.params ?? {};
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const [shouldBlockWindowOpen, setShouldBlockWindowOpen] = useState(false);
    const selectedBank = addNewCard?.data?.selectedBank;
    const bankName = bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank;
    const {isOffline} = useNetwork();
    const plaidToken = addNewCard?.data?.publicToken;
    const isPlaid = !!plaidToken;
    const url = getPersonalCardBankConnection(bankName);
    const headerTitle = translate('workspace.companyCards.addCards');
    const onImportPlaidAccounts = useImportPersonalPlaidAccounts();
    const newCard = useGetNewPersonalCard();
    const onOpenBankConnectionFlow = useCallback(() => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    }, [url]);

    const handleBackButtonPress = () => {
        customWindow?.close();
        setAddNewPersonalCardStepAndData({step: CONST.PERSONAL_CARDS.STEP.SELECT_BANK});
    };

    const CustomSubtitle = (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, addNewCard?.data?.plaidConnectedFeedName ?? bankName)}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
        </Text>
    );

    useEffect(() => {
        if ((!url && !isPlaid) || isOffline) {
            return;
        }
        if (newCard) {
            setShouldBlockWindowOpen(true);
            customWindow?.close();
            setAddNewPersonalCardStepAndData({
                step: CONST.PERSONAL_CARDS.STEP.SUCCESS,
            });
            return;
        }
        if (!shouldBlockWindowOpen) {
            if (isPlaid) {
                onImportPlaidAccounts();
                return;
            }
            if (url) {
                customWindow = openBankConnection(url);
            }
        }
    }, [isOffline, isPlaid, newCard, onImportPlaidAccounts, shouldBlockWindowOpen, url]);

    const getContent = () => {
        if (newCard?.errors) {
            return <PersonalCardsErrorConfirmation cardID={newCard?.cardID} />;
        }
        if (!isPlaid) {
            return (
                <BlockingView
                    icon={illustrations.PendingBank}
                    iconWidth={styles.pendingBankCardIllustration.width}
                    iconHeight={styles.pendingBankCardIllustration.height}
                    title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                    CustomSubtitle={CustomSubtitle}
                    onLinkPress={onOpenBankConnectionFlow}
                    addBottomSafeAreaPadding
                />
            );
        }
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flex1}
            />
        );
    };

    return (
        <ScreenWrapper
            testID="BankConnection"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>{getContent()}</FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default BankConnection;
