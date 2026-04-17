import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/ListItem/CardListItem';
import type {AdditionalCardProps} from '@components/SelectionList/ListItem/CardListItem';
import type {ListItem} from '@components/SelectionList/types';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSpendRuleFormValuesFromCardRule} from '@libs/actions/Card';
import {updateDraftSpendRule} from '@libs/actions/User';
import {filterCardsByPersonalDetails, filterInactiveCards, getCardFeedIcon, sortCardsByCardholderName} from '@libs/CardUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card, ExpensifyCardSettings, WorkspaceCardsList} from '@src/types/onyx';
import type {ExpensifyCardRule} from '@src/types/onyx/ExpensifyCardSettings';
import {getParentRoute} from './SpendRulesUtils';

type ExpensifyCardListItem = ListItem &
    AdditionalCardProps & {
        card: Card;
    };

type SpendRuleCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_CARD>;

function getCardIDsWithSpendRules(cardRules: Record<string, ExpensifyCardRule> | undefined, currentRuleID?: string): Set<number> {
    const cardIDs = new Set<number>();
    if (!cardRules) {
        return cardIDs;
    }

    for (const [ruleID, rule] of Object.entries(cardRules)) {
        if (ruleID === currentRuleID) {
            continue;
        }
        const formValues = getSpendRuleFormValuesFromCardRule(rule);
        for (const cardID of formValues?.cardIDs ?? []) {
            const numericCardID = Number(cardID);
            if (Number.isFinite(numericCardID)) {
                cardIDs.add(numericCardID);
            }
        }
    }

    return cardIDs;
}

function getEligibleCards(cardsList: OnyxEntry<WorkspaceCardsList>, expensifyCardSettings: ExpensifyCardSettings, currentRuleID?: string) {
    const {cardList, ...cards} = cardsList ?? {};
    const cardIDsWithSpendRules = getCardIDsWithSpendRules(expensifyCardSettings?.cardRules, currentRuleID);
    return Object.values(cards).filter((card: Card) => !cardIDsWithSpendRules.has(card.cardID));
}

function SpendRuleCardPage({route}: SpendRuleCardPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const defaultFundID = useDefaultFundID(policyID);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const illustrations = useMemoizedLazyIllustrations(['HandCard']);
    const themeIllustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const [selectedCardIDs, setSelectedCardIDs] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            setSelectedCardIDs(spendRuleForm?.cardIDs ?? []);
        }, [spendRuleForm?.cardIDs]),
    );

    const parentRoute = getParentRoute(policyID, ruleID);

    const {isOffline} = useNetwork({
        onReconnect: () => {
            openPolicyExpensifyCardsPage(policyID, defaultFundID);
        },
    });

    const isCardSettingsLoading = !isOffline && (!expensifyCardSettings || expensifyCardSettings.isLoading) && !expensifyCardSettings?.hasOnceLoaded;
    const eligibleCards = expensifyCardSettings ? getEligibleCards(cardsList, expensifyCardSettings, ruleID === ROUTES.NEW ? undefined : ruleID) : [];

    const filterCard = (card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails);
    const sortCards = (cards: Card[]) => sortCardsByCardholderName(cards, personalDetails, localeCompare);

    const [inputValue, setInputValue, filteredCards] = useSearchResults(eligibleCards, filterCard, sortCards);

    const listData: ExpensifyCardListItem[] = filteredCards.map((card) => {
        const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const cardOwnerPersonalDetails = personalDetails?.[accountID] ?? undefined;
        const cardName = card.nameValuePairs?.cardTitle;
        const displayName = getDisplayNameOrDefault(cardOwnerPersonalDetails, '', false);
        return {
            keyForList: String(card.cardID),
            text: displayName !== '' ? displayName : (cardName ?? ''),
            accountID,
            card,
            lastFourPAN: card.lastFourPAN,
            isVirtual: !!card.nameValuePairs?.isVirtual,
            shouldShowOwnersAvatar: true,
            cardOwnerPersonalDetails,
            bankIcon: {
                icon: getCardFeedIcon(card.bank, themeIllustrations, companyCardFeedIcons),
            },
        };
    });

    useEffect(() => {
        // We already load the card settings in when the section is mounted, so we don't load it again here.
        // We only need to load it if the user is navigated directly to this page and the card settings are not already loaded.
        if (!expensifyCardSettings || expensifyCardSettings?.isLoading || expensifyCardSettings?.hasOnceLoaded) {
            return;
        }
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [defaultFundID, expensifyCardSettings, policyID]);

    const toggleCard = (item: ExpensifyCardListItem) => {
        setSelectedCardIDs((prev) => {
            if (prev.includes(item.keyForList)) {
                return prev.filter((id) => id !== item.keyForList);
            }
            return [...prev, item.keyForList];
        });
    };

    const toggleSelectAll = () => {
        const visibleKeys = listData.map((item) => item.keyForList);
        const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedCardIDs.includes(key));
        if (allVisibleSelected) {
            const visibleSet = new Set(visibleKeys);
            setSelectedCardIDs((prev) => prev.filter((id) => !visibleSet.has(id)));
            return;
        }
        setSelectedCardIDs((prev) => {
            const next = new Set(prev);
            for (const key of visibleKeys) {
                next.add(key);
            }
            return Array.from(next);
        });
    };

    const handleSave = () => {
        if (isCardSettingsLoading) {
            return;
        }

        const eligibleCardIDs = new Set(eligibleCards.map((card) => String(card.cardID)));
        const validSelectedCardIDs = selectedCardIDs.filter((cardID) => eligibleCardIDs.has(cardID));

        if (validSelectedCardIDs.length !== selectedCardIDs.length) {
            setSelectedCardIDs(validSelectedCardIDs);
            return;
        }

        updateDraftSpendRule({cardIDs: validSelectedCardIDs});
        Navigation.goBack(parentRoute);
    };

    const hasEligibleCards = eligibleCards.length > 0;
    const headerMessage = hasEligibleCards ? getHeaderMessage(listData.length > 0, false, inputValue, countryCode, false) : '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            {isCardSettingsLoading ? (
                <FullScreenLoadingIndicator
                    shouldUseGoBackButton
                    reasonAttributes={{
                        context: 'SpendRuleCardPage',
                        isOffline,
                        hasOnceLoaded: !!expensifyCardSettings?.hasOnceLoaded,
                    }}
                />
            ) : (
                <ScreenWrapper
                    testID="SpendRuleCardPage"
                    shouldEnableMaxHeight
                    offlineIndicatorStyle={styles.mtAuto}
                    includeSafeAreaPaddingBottom
                >
                    <HeaderWithBackButton
                        title={translate('workspace.rules.spendRules.cardPageTitle')}
                        onBackButtonPress={() => Navigation.goBack(parentRoute)}
                    />
                    <SelectionList
                        canSelectMultiple
                        textInputOptions={
                            hasEligibleCards
                                ? {
                                      headerMessage,
                                      value: inputValue,
                                      label: translate('common.search'),
                                      onChangeText: setInputValue,
                                  }
                                : undefined
                        }
                        data={listData}
                        style={{
                            listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                            listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                        }}
                        onSelectAll={listData.length > 0 ? toggleSelectAll : undefined}
                        onCheckboxPress={toggleCard}
                        onSelectRow={toggleCard}
                        selectedItems={selectedCardIDs}
                        ListItem={CardListItem}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        shouldUpdateFocusedIndex
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        listEmptyContent={
                            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                                <BlockingView
                                    icon={illustrations.HandCard}
                                    iconWidth={variables.iconSection}
                                    iconHeight={variables.iconSection}
                                    title={inputValue.trim() ? translate('common.noResultsFound') : translate('workspace.rules.spendRules.noAvailableCards')}
                                    titleStyles={styles.mb2}
                                    subtitle={translate('workspace.rules.spendRules.noAvailableCardsSubtitle')}
                                    subtitleStyle={styles.textSupporting}
                                />
                            </ScrollView>
                        }
                        footerContent={
                            <FormAlertWithSubmitButton
                                buttonText={hasEligibleCards ? translate('common.save') : translate('common.buttonConfirm')}
                                isAlertVisible={false}
                                isDisabled={isCardSettingsLoading}
                                onSubmit={handleSave}
                                enabledWhenOffline
                                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                        }
                    />
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleCardPage.displayName = 'SpendRuleCardPage';

export default SpendRuleCardPage;
