import React, {useMemo} from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {checkIfNewFeedConnected, getBankName, getCompanyCardFeed, isSelectedFeedExpired} from '@libs/CardUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceCompanyCardsErrorConfirmation from '@pages/workspace/companyCards/WorkspaceCompanyCardsErrorConfirmation';
import {getCompanyCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const {feed: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const [cardFeeds] = useCardFeeds(policyID);
    const prevFeedsData = usePrevious(cardFeeds);
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const selectedBank = addNewCard?.data?.selectedBank;
    const bankName = feed ? getBankName(getCompanyCardFeed(feed)) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds, prevFeedsData],
    );
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const isPlaid = !!plaidToken;

    const url = getCompanyCardBankConnection(policyID, bankName);
    const isFeedExpired = feed ? !!isSelectedFeedExpired(cardFeeds?.[feed]) : false;
    const headerTitleAddCards = !backTo ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate(isRefreshConnectionFlow ? 'workspace.moreFeatures.companyCards.assignNewCards' : 'workspace.companyCards.assignCard') : headerTitleAddCards;
    const isNewFeedHasError = !!(newFeed && cardFeeds?.[newFeed]?.errors);
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);

    const {onOpenBankConnectionFlow, handleBackButtonPress} = useBankConnection({
        policyID,
        feed,
        isPlaid,
        url,
        isNewFeedConnected: !!isNewFeedConnected,
        newFeed,
        isFeedExpired,
        isNewFeedHasError,
        onSuccess,
        onFailure,
        onBackButtonPress,
        cardFeeds,
    });

    const CustomSubtitle = (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName && translate(`workspace.moreFeatures.companyCards.pendingBankDescription`, addNewCard?.data?.plaidConnectedFeedName ?? bankName)}
            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
        </Text>
    );

    const getContent = () => {
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
