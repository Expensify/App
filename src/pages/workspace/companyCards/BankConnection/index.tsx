import React from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceCompanyCardsErrorConfirmation from '@pages/workspace/companyCards/WorkspaceCompanyCardsErrorConfirmation';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useBankConnection from './useBankConnection';

type BankConnectionProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed for assign card flow */
    feed?: CompanyCardFeedWithDomainID;

    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;

    /** Whether this is a refresh card list flow */
    isRefreshConnectionFlow?: boolean;

    /** Called when the assign flow succeeds */
    onSuccess?: () => void;

    /** Called when the assign flow fails due to broken connection */
    onFailure?: () => void;

    /** Called when the back button is pressed */
    onBackButtonPress?: () => void;
};

function BankConnection({policyID: policyIDFromProps, feed, route, isRefreshConnectionFlow, onSuccess, onFailure, onBackButtonPress}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const {feed: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;

    const {
        onOpenBankConnectionFlow,
        handleBackButtonPress,
        bankName,
        bankDisplayName,
        isPlaid,
        isNewFeedHasError,
        newFeed,
        isAllFeedsResultLoading,
        isBlockedToAddNewFeeds,
        isRefreshComplete,
    } = useBankConnection({
        policyID,
        feed,
        bankNameFromRoute,
        onSuccess,
        onFailure,
        onBackButtonPress,
        isRefreshConnectionFlow,
    });

    const headerTitleAddCards = !backTo ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.assignCard') : headerTitleAddCards;

    const CustomSubtitle = (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, bankDisplayName ?? bankName)}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
        </Text>
    );

    const getContent = () => {
        if (isRefreshComplete) {
            return (
                <ConfirmationPage
                    heading={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccess')}
                    description={translate('workspace.moreFeatures.companyCards.refreshConnectionSuccessDescription')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.dismissModal()}
                />
            );
        }
        if (isNewFeedHasError) {
            return (
                <WorkspaceCompanyCardsErrorConfirmation
                    policyID={policyID}
                    newFeed={newFeed}
                />
            );
        }
        if (!isPlaid && !isAllFeedsResultLoading && (!isBlockedToAddNewFeeds || !!feed)) {
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
        const activityReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'BankConnection',
            isPlaid,
            isAllFeedsResultLoading,
            isBlockedToAddNewFeedsWithoutFeed: isBlockedToAddNewFeeds && !feed,
        };
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flex1}
                reasonAttributes={activityReasonAttributes}
            />
        );
    };

    return (
        <ScreenWrapper
            testID={isRefreshComplete ? 'RefreshCardFeedConnectionSuccess' : 'BankConnection'}
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
