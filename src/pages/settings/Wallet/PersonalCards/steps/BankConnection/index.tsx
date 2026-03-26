import React, {useEffect} from 'react';
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
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import PersonalCardsErrorConfirmation from '@pages/settings/Wallet/PersonalCards/PersonalCardsErrorConfirmation';
import useGetNewPersonalCard from '@pages/settings/Wallet/PersonalCards/useGetNewPersonalCard';
import {getPersonalCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import {setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import openBankConnection from './openBankConnection';

let customWindow: Window | null = null;

type BankConnectionProps = {
    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_BANK_CONNECTION>;
};

type BankConnectionContentProps = {
    hasImportError: boolean;
    isPlaid?: boolean;
    onOpenBankConnectionFlow: () => void;
    bankName?: string | null;
    plaidConnectedFeedName?: string;
};

function BankConnectionContent({hasImportError, isPlaid, onOpenBankConnectionFlow, bankName, plaidConnectedFeedName}: BankConnectionContentProps) {
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    if (hasImportError) {
        return <PersonalCardsErrorConfirmation />;
    }
    if (!isPlaid) {
        return (
            <BlockingView
                icon={illustrations.PendingBank}
                iconWidth={styles.pendingBankCardIllustration.width}
                iconHeight={styles.pendingBankCardIllustration.height}
                title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                CustomSubtitle={
                    <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                        {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, plaidConnectedFeedName ?? bankName)}
                        <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
                    </Text>
                }
                onLinkPress={onOpenBankConnectionFlow}
                addBottomSafeAreaPadding
            />
        );
    }
    const activityReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'PersonalCardBankConnection',
        isPlaid,
    };
    return (
        <ActivityIndicator
            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
            style={styles.flex1}
            reasonAttributes={activityReasonAttributes}
        />
    );
}

function BankConnection({route}: BankConnectionProps) {
    const {translate} = useLocalize();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const {feed: bankNameFromRoute} = route?.params ?? {};
    const bankName = bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? addNewCard?.data?.selectedBank;
    const {isOffline} = useNetwork();
    const plaidToken = addNewCard?.data?.publicToken;
    const isPlaid = !!plaidToken;
    const url = getPersonalCardBankConnection(bankName);
    const headerTitle = translate('workspace.companyCards.addCards');
    const onImportPlaidAccounts = useImportPersonalPlaidAccounts();
    const newCard = useGetNewPersonalCard();
    const hasImportError = !isEmptyObject(addNewCard?.errors);

    const onOpenBankConnectionFlow = () => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    };

    const handleBackButtonPress = () => {
        customWindow?.close();
        setAddNewPersonalCardStepAndData({step: CONST.PERSONAL_CARDS.STEP.SELECT_BANK});
    };

    useEffect(() => {
        if ((!url && !isPlaid) || isOffline) {
            return;
        }
        if (hasImportError) {
            customWindow?.close();
            return;
        }
        if (newCard && !hasImportError) {
            customWindow?.close();
            setAddNewPersonalCardStepAndData({
                step: CONST.PERSONAL_CARDS.STEP.SUCCESS,
            });
            return;
        }
        if (isPlaid) {
            onImportPlaidAccounts();
            return;
        }
        if (url) {
            customWindow = openBankConnection(url);
        }
    }, [hasImportError, isOffline, isPlaid, newCard, onImportPlaidAccounts, url]);

    return (
        <ScreenWrapper
            testID="BankConnection"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <BankConnectionContent
                    bankName={bankName}
                    hasImportError={hasImportError}
                    onOpenBankConnectionFlow={onOpenBankConnectionFlow}
                    plaidConnectedFeedName={addNewCard?.data?.plaidConnectedFeedName}
                    isPlaid={isPlaid}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default BankConnection;
