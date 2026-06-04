import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import SelectionList from '@components/SelectionList';
import SpendRuleListItem from '@components/SelectionList/ListItem/SpendRuleListItem';
import type {SpendRuleListItemType} from '@components/SelectionList/ListItem/types';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardData} from '@libs/actions/Card';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type SpendRuleSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_SELECTION>;

function SpendRuleSelectionPage({route}: SpendRuleSelectionPageProps) {
    const {policyID} = route.params;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);
    const {cardRules, isLoadingCardRules} = useExpensifyCardRules(policyID);
    const [issueCardForm, issueCardFormMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const [shouldShowError, setShouldShowError] = useState(false);
    const [cardRuleID, setCardRuleID] = useState(issueCardForm?.data?.spendRuleID);

    const isLoadingIssueCardForm = isLoadingOnyxValue(issueCardFormMetadata);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_SELECTION.path);

    useEffect(() => {
        if (issueCardForm?.data || isLoadingIssueCardForm) {
            return;
        }

        Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    }, [isLoadingIssueCardForm, issueCardForm?.data, policyID]);

    // We only allow cards that share the same currency to be on a spend rule
    const availableCardRules = cardRules.filter((cardRule) => cardRule.currencyCode === issueCardForm?.data?.currency);
    const cardRuleListItems: SpendRuleListItemType[] = availableCardRules.map((cardRule) => ({
        keyForList: cardRule.ruleID,
        action: cardRule.action,
        summary: cardRule.cardSummary,
        searchTokens: cardRule.searchTokens,
        summaryParts: cardRule.summaryParts,
        isSelected: cardRule.ruleID === cardRuleID,
        accessibilityLabel: cardRule.accessibilityLabel,
    }));

    const filterCardRules = (cardRuleListItem: SpendRuleListItemType, searchInput: string) => {
        const results = tokenizedSearch([cardRuleListItem], searchInput, (option) => option.searchTokens);
        return results.length > 0;
    };

    const [inputValue, setInputValue, filteredCardRules] = useSearchResults(cardRuleListItems, filterCardRules);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const onSelectCardRule = (item: SpendRuleListItemType) => {
        setCardRuleID(item.keyForList);
        setShouldShowError(false);
    };

    const onSubmit = () => {
        if (!cardRuleID) {
            setShouldShowError(true);
            return;
        }

        setShouldShowError(false);
        setIssueNewCardData(policyID, {spendRuleID: cardRuleID}).then(() => {
            goBack();
        });
    };

    const headerContent = cardRuleListItems.length > CONST.STANDARD_LIST_ITEM_LIMIT && (
        <SearchBar
            label={translate('workspace.card.searchRules')}
            inputValue={inputValue}
            onChangeText={setInputValue}
            shouldShowEmptyState={!isLoadingCardRules && filteredCardRules.length === 0}
        />
    );

    const isLoadedAndEmpty = !isLoadingCardRules && !cardRules.length;
    const isLoadedWithContent = !isLoadingCardRules && cardRules.length > 0;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="SpendRuleSelectionPage"
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
                                context: 'SpendRuleSelectionPage',
                                isLoadingFromOnyx: true,
                            }}
                        />
                    </View>
                )}

                {isLoadedAndEmpty && (
                    <GenericEmptyStateComponent
                        headerMedia={illustrations.EmptyShelves}
                        headerContentStyles={styles.emptyShelvesIllustration}
                        title={translate('workspace.card.issueNewCard.spendRulesEmptyStateTitle')}
                        subtitle={translate('workspace.card.issueNewCard.spendRulesEmptyStateSubtitle')}
                        headerStyles={styles.emptyStateCardIllustrationContainer}
                    />
                )}

                {isLoadedWithContent && (
                    <SelectionList
                        ListItem={SpendRuleListItem}
                        data={filteredCardRules}
                        canSelectMultiple={false}
                        customListHeader={headerContent}
                        shouldShowListEmptyContent={false}
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

export default SpendRuleSelectionPage;
