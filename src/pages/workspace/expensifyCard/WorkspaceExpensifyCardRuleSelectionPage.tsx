import React, {useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import SelectionList from '@components/SelectionList';
import CardRuleListItem from '@components/SelectionList/ListItem/CardRuleListItem';
import {CardRuleListItemType} from '@components/SelectionList/ListItem/types';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardData} from '@libs/actions/Card';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardRuleSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_SELECTION>;

function WorkspaceExpensifyCardRuleSelectionPage({route}: WorkspaceExpensifyCardRuleSelectionPageProps) {
    const {policyID} = route.params;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardRules, isLoadingCardRules} = useExpensifyCardRules(policyID);
    const [issueCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const [shouldShowError, setShouldShowError] = useState(false);
    const [cardRuleID, setCardRuleID] = useState(issueCardForm?.data?.cardRuleID ?? '');

    const cardRuleListItems: CardRuleListItemType[] = cardRules.map((cardRule) => ({
        keyForList: cardRule.ruleID,
        action: cardRule.action,
        summary: cardRule.cardSummary,
        searchTokens: cardRule.searchTokens,
        summaryParts: cardRule.summaryParts,
        isSelected: cardRule.ruleID === cardRuleID,
        accessibilityLabel: cardRule.accessibilityLabel,
    }));

    const filterCardRules = (cardRuleListItem: CardRuleListItemType, searchInput: string) => {
        const results = tokenizedSearch([cardRuleListItem], searchInput, (option) => option.searchTokens);
        return results.length > 0;
    };

    const [inputValue, setInputValue, filteredCardRules] = useSearchResults(cardRuleListItems, filterCardRules);

    const goBack = () => {
        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
    };

    const onSelectCardRule = (item: CardRuleListItemType) => {
        setCardRuleID(item.keyForList);
        setShouldShowError(false);
    };

    const onSubmit = async () => {
        if (!cardRuleID) {
            setShouldShowError(true);
            return;
        }

        setShouldShowError(false);
        setIssueNewCardData(policyID, {cardRuleID}).then(() => {
            goBack();
        });
    };

    const headerContent = cardRuleListItems.length > CONST.SEARCH_ITEM_LIMIT && (
        <SearchBar
            label={translate('workspace.card.searchRules')}
            inputValue={inputValue}
            onChangeText={setInputValue}
            shouldShowEmptyState={!isLoadingCardRules && filteredCardRules.length === 0}
        />
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardRuleSelectionPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.chooseRule')}
                    onBackButtonPress={goBack}
                />

                {!!isLoadingCardRules && (
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator
                            color={theme.spinner}
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.pl3]}
                            reasonAttributes={{
                                context: 'WorkspaceExpensifyCardRuleSelectionPage',
                                isLoadingFromOnyx: true,
                            }}
                        />
                    </View>
                )}

                {!isLoadingCardRules && (
                    <SelectionList
                        ListItem={CardRuleListItem}
                        data={filteredCardRules}
                        canSelectMultiple={false}
                        customListHeader={headerContent}
                        onSelectRow={onSelectCardRule}
                        footerContent={
                            <FormAlertWithSubmitButton
                                buttonText={translate('common.save')}
                                onSubmit={onSubmit}
                                isAlertVisible={shouldShowError}
                                containerStyles={[!shouldShowError && styles.mt5]}
                                message={translate('common.error.pleaseSelectOne')}
                            />
                        }
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardRuleSelectionPage;
