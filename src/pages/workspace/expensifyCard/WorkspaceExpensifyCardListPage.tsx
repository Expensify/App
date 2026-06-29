import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CardFeedIcon from '@components/CardFeedIcon';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FeedSelector from '@components/FeedSelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceExpensifyCardTableRowData} from '@components/Tables/WorkspaceExpensifyCardsTable';
import WorkspaceExpensifyCardsTable from '@components/Tables/WorkspaceExpensifyCardsTable';
import Text from '@components/Text';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEmptyViewHeaderHeight from '@hooks/useEmptyViewHeaderHeight';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearIssueNewCardFormData, exportExpensifyCardListToCSV, setIssueNewCardStepAndData} from '@libs/actions/Card';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearDeletePaymentMethodError} from '@libs/actions/PaymentMethods';
import {getCardsByCardholderName, getCardSettings, isCurrencySupportedForECards} from '@libs/CardUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WorkspaceCardsList} from '@src/types/onyx';
import EmptyCardView from './EmptyCardView';

type WorkspaceExpensifyCardListPageProps = {
    /** Route from navigation */
    route: PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

    /** List of Expensify cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Fund ID */
    fundID: number;
};

function WorkspaceExpensifyCardListPage({route, cardsList, fundID}: WorkspaceExpensifyCardListPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Export', 'Gear', 'Plus']);
    const {shouldUseNarrowLayout, isMediumScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HandCard', 'ExpensifyCardImage']);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const defaultFundID = useDefaultFundID(policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const settings = getCardSettings(cardSettings);
    const {allFeeds: allAdminExpensifyCardFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const shouldShowSelector = allAdminExpensifyCardFeeds.length >= 1;
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const isBankAccountVerified = !cardOnWaitlist;
    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    const {windowHeight} = useWindowDimensions();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const {canWrite: canWriteExpensifyCard, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);
    const headerHeight = useEmptyViewHeaderHeight(shouldDisplayButtonsInSeparateLine, isBankAccountVerified);
    const [footerHeight, setFooterHeight] = useState(0);
    const cardFeedIcon = (
        <CardFeedIcon
            isExpensifyCardFeed
            iconProps={{height: variables.cardIconHeight, width: variables.cardIconWidth, additionalStyles: styles.cardIcon}}
        />
    );

    const settlementCurrency = useCurrencyForExpensifyCard({policyID, fundID});
    const shouldShowEuUkDisclaimer = isCurrencySupportedForECards(settlementCurrency);
    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    const isCardListEmpty = allCards.length === 0;
    const [selectedCardKeys, setSelectedCardKeys] = useState<string[]>([]);
    const selectableCardKeySet = useMemo(() => new Set(allCards.map((card) => String(card.cardID))), [allCards]);
    const validatedSelectedCardKeys = useMemo(() => selectedCardKeys.filter((key) => selectableCardKeySet.has(key)), [selectedCardKeys, selectableCardKeySet]);
    const selectedCardIDs = useMemo(() => validatedSelectedCardKeys.map((key) => Number(key)), [validatedSelectedCardKeys]);

    const clearTableSelection = useCallback(() => {
        setSelectedCardKeys((prevSelectedCardKeys) => (prevSelectedCardKeys.length > 0 ? [] : prevSelectedCardKeys));
    }, []);

    useCleanupSelectedOptions(clearTableSelection);

    const cardRows = useMemo<WorkspaceExpensifyCardTableRowData[]>(
        () =>
            allCards.map((card) => {
                const frozenByDisplayName = card.nameValuePairs?.frozen?.byAccountID
                    ? getDisplayNameOrDefault(personalDetails?.[card.nameValuePairs.frozen.byAccountID], '', false) || undefined
                    : undefined;

                return {
                    keyForList: String(card.cardID),
                    cardID: card.cardID,
                    card,
                    lastFourPAN: card.lastFourPAN ?? '',
                    name: card.nameValuePairs?.cardTitle ?? '',
                    cardholder: personalDetails?.[card.accountID ?? CONST.DEFAULT_NUMBER_ID],
                    limit: card.nameValuePairs?.unapprovedExpenseLimit ?? 0,
                    currency: settlementCurrency,
                    isVirtual: !!card.nameValuePairs?.isVirtual,
                    limitType: card.nameValuePairs?.limitType,
                    frozenByDisplayName,
                    frozenByAccountID: card.nameValuePairs?.frozen?.byAccountID,
                    frozenDate: card.nameValuePairs?.frozen?.date,
                    errors: card.errors,
                    pendingAction: card.pendingAction,
                    action: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(item.cardID.toString()))),
                    onClose: () => clearDeletePaymentMethodError(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, card.cardID),
                };
            }),
        [allCards, defaultFundID, personalDetails, policyID, settlementCurrency],
    );

    const bulkExportOptions: Array<DropdownOption<typeof CONST.EXPENSIFY_CARD.BULK_ACTIONS.EXPORT_CSV>> = [
        {
            icon: icons.Export,
            text: translate('workspace.expensifyCard.exportAsCSV'),
            value: CONST.EXPENSIFY_CARD.BULK_ACTIONS.EXPORT_CSV,
            onSelected: () => {
                const selectedCards = cardRows.filter((row) => validatedSelectedCardKeys.includes(row.keyForList)).map((row) => row.card);
                exportExpensifyCardListToCSV({
                    policyID,
                    cards: selectedCards,
                    personalDetailsList: personalDetails,
                    settlementCurrency,
                    translate,
                });
            },
        },
    ];

    const handleIssueCardPress = () => {
        if (!canWriteExpensifyCard) {
            showReadOnlyModal();
            return;
        }
        clearIssueNewCardFormData();
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };
    const secondaryActions = canWriteExpensifyCard
        ? [
              {
                  icon: icons.Gear,
                  text: translate('common.settings'),
                  onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID)),
                  value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
              },
          ]
        : [];
    const getHeaderButtons = () => {
        const headerButtonsRowStyle = [
            styles.flexRow,
            styles.gap2,
            !shouldShowSelector && shouldDisplayButtonsInSeparateLine && styles.mb3,
            shouldShowSelector && shouldDisplayButtonsInSeparateLine && styles.mt3,
        ];

        const shouldShowBulkSelectionDropdown = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : selectedCardIDs.length > 0;

        if (shouldShowBulkSelectionDropdown) {
            return (
                <View style={headerButtonsRowStyle}>
                    <ButtonWithDropdownMenu<typeof CONST.EXPENSIFY_CARD.BULK_ACTIONS.EXPORT_CSV>
                        success
                        onPress={() => {}}
                        customText={translate('workspace.common.selected', {count: selectedCardIDs.length})}
                        options={bulkExportOptions}
                        isSplitButton={false}
                        shouldAlwaysShowDropdownMenu
                        isDisabled={!selectedCardIDs.length}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE_EXPENSIFY_CARD.BULK_ACTIONS_DROPDOWN}
                        wrapperStyle={[!isInLandscapeMode && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.flexShrink1]}
                    />
                </View>
            );
        }

        return (
            <View style={headerButtonsRowStyle}>
                {!isCardListEmpty && (
                    <Button
                        success
                        onPress={handleIssueCardPress}
                        icon={icons.Plus}
                        text={translate('workspace.expensifyCard.issueCard')}
                        style={shouldDisplayButtonsInSeparateLine && styles.flex1}
                        innerStyles={!canWriteExpensifyCard ? styles.buttonOpacityDisabled : undefined}
                        hoverStyles={!canWriteExpensifyCard ? styles.buttonOpacityDisabled : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_BUTTON}
                    />
                )}
                {secondaryActions.length > 0 && (
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        customText={translate('common.more')}
                        options={secondaryActions}
                        isSplitButton={false}
                        shouldUseOptionIcon
                        wrapperStyle={isCardListEmpty && !isInLandscapeMode ? styles.flexGrow1 : styles.flexGrow0}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.MORE_DROPDOWN}
                    />
                )}
            </View>
        );
    };

    const handleBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            clearTableSelection();
            turnOffMobileSelectionMode();
            return true;
        }

        Navigation.goBack();
        return true;
    };
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const shouldShowHeaderButtons = (shouldUseNarrowLayout && isMobileSelectionModeEnabled) || selectedCardIDs.length > 0 || canWriteExpensifyCard || !isCardListEmpty;

    useAndroidBackButtonHandler(handleBackButtonPress);

    const disclaimerFooter = (
        <Text
            style={[styles.textMicroSupporting, styles.p5, footerHeight === 0 && {opacity: 0}]}
            onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
        >
            {translate(shouldShowEuUkDisclaimer ? 'workspace.expensifyCard.euUkDisclaimer' : 'workspace.expensifyCard.disclaimer')}
        </Text>
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
            testID="WorkspaceExpensifyCardListPage"
        >
            <HeaderWithBackButton
                icon={!selectionModeHeader ? illustrations.HandCard : undefined}
                shouldUseHeadlineHeader={!selectionModeHeader}
                title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.expensifyCard')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplayHelpButton
                onBackButtonPress={handleBackButtonPress}
            >
                {!shouldShowSelector && !shouldDisplayButtonsInSeparateLine && isBankAccountVerified && shouldShowHeaderButtons && getHeaderButtons()}
            </HeaderWithBackButton>
            {!shouldShowSelector && shouldDisplayButtonsInSeparateLine && isBankAccountVerified && shouldShowHeaderButtons && <View style={styles.ph5}>{getHeaderButtons()}</View>}
            {shouldShowSelector && (
                <View style={[styles.w100, styles.ph5, styles.pb3, (!shouldChangeLayout || isInLandscapeMode) && [styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]]}>
                    <FeedSelector
                        wrapperStyle={isInLandscapeMode ? styles.flex1 : undefined}
                        onFeedSelect={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.path))}
                        CardFeedIcon={cardFeedIcon}
                        feedName={translate('workspace.common.expensifyCard')}
                        supportingText={getExpensifyCardFeedDescription(cardSettings, allPolicies, domains, fundID, cardList)}
                    />
                    {isBankAccountVerified && (canWriteExpensifyCard || secondaryActions.length > 0 || !isCardListEmpty) && getHeaderButtons()}
                </View>
            )}
            {isCardListEmpty ? (
                <EmptyCardView
                    isBankAccountVerified={isBankAccountVerified}
                    policyID={policyID}
                    buttons={[
                        {
                            buttonText: translate('workspace.expensifyCard.issueCard'),
                            buttonAction: handleIssueCardPress,
                            success: true,
                            innerStyles: !canWriteExpensifyCard ? styles.buttonOpacityDisabled : undefined,
                            hoverStyles: !canWriteExpensifyCard ? styles.buttonOpacityDisabled : undefined,
                        },
                    ]}
                />
            ) : (
                <View style={styles.flex1}>
                    <WorkspaceExpensifyCardsTable
                        policyID={policyID}
                        cards={cardRows}
                        selectionEnabled={cardRows.length > 0}
                        selectedKeys={validatedSelectedCardKeys}
                        onRowSelectionChange={setSelectedCardKeys}
                        cardSettings={cardSettings}
                        cardSettingsBase={settings}
                        personalDetails={personalDetails}
                        listFooterComponent={disclaimerFooter}
                        listFooterComponentStyle={[styles.flexGrow1, styles.justifyContentEnd]}
                        listContentContainerStyle={[styles.flexGrow1, {minHeight: windowHeight - headerHeight + footerHeight}]}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceExpensifyCardListPage;
