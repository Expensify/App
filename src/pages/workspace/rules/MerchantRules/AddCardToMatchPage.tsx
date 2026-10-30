import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {getCardDescription} from '@libs/CardUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import usePolicyCards from './usePolicyCards';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddCardToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CARD_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_CARD_TO_MATCH>;

type CardListItem = ListItem & {
    value: string;
};

function AddCardToMatchPage({route}: AddCardToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_CARD_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyCards = usePolicyCards(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {selectedValues: selectedCards, initialSelectedValues: initialSelectedCards, toggleValue: toggleCardValue, toggleAll} = useRuleConditionSelection(form?.cardsToMatch ?? []);

    // Stored as card IDs, which is what the `cardID` filter carries.
    const cardItems: CardListItem[] = policyCards.map((card) => ({
        keyForList: String(card.cardID),
        text: getCardDescription(card, translate),
        value: String(card.cardID),
        isSelected: selectedCards.includes(String(card.cardID)),
    }));

    // A rule keeps matching on a card that has since been removed from the workspace. Listing it is the only way
    // to see what the rule matches on and the only way to take it off, so it is added back rather than left out.
    const listedCardIDs = new Set(cardItems.map((item) => item.value));
    for (const cardID of selectedCards) {
        if (listedCardIDs.has(cardID)) {
            continue;
        }
        cardItems.push({keyForList: cardID, text: cardID, value: cardID, isSelected: true});
    }

    const filterCard = (item: CardListItem, searchInput: string) => tokenizedSearch([item], searchInput, (card) => [card.text ?? '']).length > 0;

    // Pin the initially selected cards to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedCardItems = moveInitialSelectionToTop(
        [...cardItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCards,
    );

    const [inputValue, setInputValue, filteredCardItems] = useSearchResults(sortedCardItems, filterCard);

    const toggleCard = (item: CardListItem) => toggleCardValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredCardItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every card leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        updateDraftMerchantRule({cardsToMatch: selectedCards});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddCardToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.card')}
                onBackButtonPress={goBackToRule}
            />
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredCardItems}
                selectedItems={selectedCards}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleCard}
                onSelectionButtonPress={toggleCard}
                onSelectAll={filteredCardItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={
                    sortedCardItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT
                        ? {
                              value: inputValue,
                              label: translate('common.search'),
                              onChangeText: setInputValue,
                          }
                        : undefined
                }
                style={{
                    listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                    listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                }}
                listEmptyContent={
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <BlockingView
                            icon={illustrations.Telescope}
                            iconWidth={variables.emptyListIconWidth}
                            iconHeight={variables.emptyListIconHeight}
                            title={translate('common.noResultsFound')}
                        />
                    </ScrollView>
                }
                footerContent={
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        isAlertVisible={false}
                        onSubmit={handleSave}
                        enabledWhenOffline
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                    />
                }
            />
        </ScreenWrapper>
    );
}

export default AddCardToMatchPage;
