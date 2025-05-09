import React, {useCallback, useMemo, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import Button from '@components/Button';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FeedSelector from '@components/FeedSelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Gear, Plus} from '@components/Icon/Expensicons';
import {HandCard} from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDeletePaymentMethodError} from '@libs/actions/PaymentMethods';
import {filterCardsByPersonalDetails, getCardsByCardholderName, sortCardsByCardholderName} from '@libs/CardUtils';
import goBackFromWorkspaceCentralScreen from '@libs/Navigation/helpers/goBackFromWorkspaceCentralScreen';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDescriptionForPolicyDomainCard, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import EmptyCardView from './EmptyCardView';
import WorkspaceCardListHeader from './WorkspaceCardListHeader';
import WorkspaceCardListLabels from './WorkspaceCardListLabels';
import WorkspaceCardListRow from './WorkspaceCardListRow';

type WorkspaceExpensifyCardListPageProps = {
    /** Route from navigation */
    route: PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

    /** List of Expensify cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Fund ID */
    fundID: number;
};

function WorkspaceExpensifyCardListPage({route, cardsList, fundID}: WorkspaceExpensifyCardListPageProps) {
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`, {canBeMissing: false});
    const allExpensifyCardFeeds = useExpensifyCardFeeds(policyID);

    const shouldShowSelector = Object.keys(allExpensifyCardFeeds ?? {}).length > 1;

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate, canBeMissing: false});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;

    const isBankAccountVerified = !cardOnWaitlist;

    const policyCurrency = useMemo(() => policy?.outputCurrency ?? CONST.CURRENCY.USD, [policy]);

    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails), [personalDetails]);
    const [inputValue, setInputValue, filteredSortedCards] = useSearchResults(allCards, filterCard, sortCards);

    const handleIssueCardPress = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        const activeRoute = Navigation.getActiveRoute();
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, activeRoute));
    };

    const getHeaderButtons = () => (
        <View style={[styles.flexRow, styles.gap2, shouldChangeLayout && styles.mb3, shouldShowSelector && shouldChangeLayout && styles.mt3]}>
            <Button
                success
                onPress={handleIssueCardPress}
                icon={Plus}
                text={translate('workspace.expensifyCard.issueCard')}
                style={shouldChangeLayout && styles.flex1}
            />
            <Button
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                icon={Gear}
                text={translate('common.settings')}
                style={shouldChangeLayout && styles.flex1}
            />
        </View>
    );

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<Card>) => (
            <OfflineWithFeedback
                key={`${item.nameValuePairs?.cardTitle}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                errors={item.errors}
                onClose={() => clearDeletePaymentMethodError(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, item.cardID)}
            >
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                    accessibilityLabel="row"
                    hoverStyle={[styles.hoveredComponentBG]}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, item.cardID.toString()))}
                >
                    <WorkspaceCardListRow
                        lastFourPAN={item.lastFourPAN ?? ''}
                        cardholder={personalDetails?.[item.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                        limit={item.nameValuePairs?.unapprovedExpenseLimit ?? 0}
                        name={item.nameValuePairs?.cardTitle ?? ''}
                        currency={policyCurrency}
                        isVirtual={!!item.nameValuePairs?.isVirtual}
                    />
                </PressableWithFeedback>
            </OfflineWithFeedback>
        ),
        [personalDetails, policyCurrency, policyID, workspaceAccountID, styles],
    );

    const isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;

    const renderListHeader = useCallback(() => <WorkspaceCardListHeader cardSettings={cardSettings} />, [cardSettings]);

    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle();

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
            testID={WorkspaceExpensifyCardListPage.displayName}
        >
            <HeaderWithBackButton
                icon={HandCard}
                shouldUseHeadlineHeader
                title={translate('workspace.common.expensifyCard')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => goBackFromWorkspaceCentralScreen(policyID)}
            >
                {!shouldShowSelector && !shouldUseNarrowLayout && isBankAccountVerified && getHeaderButtons()}
            </HeaderWithBackButton>
            {!shouldShowSelector && shouldUseNarrowLayout && isBankAccountVerified && <View style={styles.ph5}>{getHeaderButtons()}</View>}
            {shouldShowSelector && (
                <View style={[styles.w100, styles.ph5, styles.pb2, !shouldChangeLayout && [styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]]}>
                    <FeedSelector
                        onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.getRoute(policyID))}
                        cardIcon={ExpensifyCardImage}
                        feedName={translate('workspace.common.expensifyCard')}
                        supportingText={getDescriptionForPolicyDomainCard(cardSettings?.domainName ?? '')}
                    />
                    {isBankAccountVerified && getHeaderButtons()}
                </View>
            )}
            {isEmptyObject(cardsList) ? (
                <EmptyCardView isBankAccountVerified={isBankAccountVerified} />
            ) : (
                <ScrollView>
                    <View style={styles.appBG}>
                        <WorkspaceCardListLabels
                            policyID={policyID}
                            cardSettings={cardSettings}
                        />
                        {allCards.length > CONST.SEARCH_ITEM_LIMIT && (
                            <SearchBar
                                label={translate('workspace.expensifyCard.findCard')}
                                inputValue={inputValue}
                                onChangeText={setInputValue}
                                shouldShowEmptyState={isSearchEmpty}
                                style={[styles.mb0, styles.mt5]}
                            />
                        )}
                    </View>
                    <FlatList
                        data={filteredSortedCards}
                        renderItem={renderItem}
                        ListHeaderComponent={!isSearchEmpty ? renderListHeader : null}
                        contentContainerStyle={bottomSafeAreaPaddingStyle}
                    />
                </ScrollView>
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </ScreenWrapper>
    );
}

WorkspaceExpensifyCardListPage.displayName = 'WorkspaceExpensifyCardListPage';

export default WorkspaceExpensifyCardListPage;
