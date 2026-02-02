import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearDraftRule, deleteExpenseRules, setDraftRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatExpenseRuleChanges, getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRule} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const getKeyForList = (rule: ExpenseRule, index: number) => `${getKeyForRule(rule)}-${index}`;

function ExpenseRulesPage() {
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'Plus', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['Flash']);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [expenseRules = getEmptyArray<ExpenseRule>(), expenseRulesResult] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [selectedRules, setSelectedRules] = useState<string[]>([]);
    const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
    const styles = useThemeStyles();

    useEffect(() => {
        // Clear selection when rule is changed as hash is outdated
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRules([]);
    }, [expenseRules]);

    const hasRules = expenseRules.length > 0;
    const isLoading = !hasRules && isLoadingOnyxValue(expenseRulesResult);

    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const isInSelectionMode = shouldUseNarrowLayout ? canSelectMultiple : selectedRules.length > 0;

    const filterRules = (ruleOption: ListItem, searchInput: string) => {
        const results = tokenizedSearch([ruleOption], searchInput, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };
    const sortRules = (data: ListItem[]) => {
        return [...data].sort((a, b) => localeCompare(a.text ?? '', b?.text ?? ''));
    };

    const rulesList: ListItem[] = expenseRules.map((rule, index) => {
        const changes = formatExpenseRuleChanges(rule, translate);
        return {
            text: rule.merchantToMatch,
            alternateText: changes,
            shouldHideAlternateText: !shouldUseNarrowLayout,
            keyForList: getKeyForList(rule, index),
            pendingAction: rule.pendingAction,
            errors: rule.errors,
            rightElement: !shouldUseNarrowLayout && (
                <View style={[styles.flex1]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.alignSelfStart]}
                    >
                        {changes}
                    </Text>
                </View>
            ),
        };
    });

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(rulesList);

    const [inputValue, setInputValue, filteredRuleList] = useSearchResults(rulesList, filterRules, sortRules);

    const toggleRule = (rule: ListItem) => {
        setSelectedRules((prev) => {
            if (prev.includes(rule.keyForList)) {
                return prev.filter((key) => key !== rule.keyForList);
            }
            return [...prev, rule.keyForList];
        });
    };

    const toggleAllRules = () => {
        const someSelected = filteredRuleList.some((rule) => selectedRules.includes(rule.keyForList));
        setSelectedRules(someSelected ? [] : filteredRuleList.map(({keyForList}) => keyForList));
    };

    const navigateToNewRulePage = () => {
        clearDraftRule();
        Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const navigateToEditRulePage = (keyForList?: string) => {
        if (!keyForList) {
            return;
        }
        const hash = keyForList.substring(0, keyForList.indexOf('-'));
        const expenseRule = expenseRules.find((rule) => getKeyForRule(rule) === hash);
        if (!expenseRule) {
            return;
        }
        setDraftRule({
            ...expenseRule,
            tax: expenseRule.tax?.field_id_TAX ? expenseRule.tax.field_id_TAX.externalID : undefined,
        });
        Navigation.navigate(ROUTES.SETTINGS_RULES_EDIT.getRoute(hash));
    };

    const onSelectRow = (item: ListItem) => {
        if (shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
            toggleRule(item);
            return;
        }
        navigateToEditRulePage(item.keyForList);
    };

    const handleDeleteRules = () => {
        if (selectedRules.length > 0) {
            const ruleKeysToDelete = selectedRules.map((keyForList) => keyForList.substring(0, keyForList.indexOf('-')));
            deleteExpenseRules(expenseRules, ruleKeysToDelete, getKeyForRule);
        }
        setDeleteConfirmModalVisible(false);
        setSelectedRules([]);
    };

    const headerDropdownOptions: Array<DropdownOption<DeepValueOf<typeof CONST.EXPENSE_RULES.BULK_ACTION_TYPES>>> = [
        {
            icon: icons.Trashcan,
            text: translate(selectedRules.length === 1 ? 'expenseRulesPage.deleteRule.deleteSingle' : 'expenseRulesPage.deleteRule.deleteMultiple'),
            value: CONST.EXPENSE_RULES.BULK_ACTION_TYPES.DELETE,
            onSelected: () => setDeleteConfirmModalVisible(true),
        },
    ];
    if (selectedRules.length === 1) {
        headerDropdownOptions.unshift({
            icon: icons.Pencil,
            text: translate('expenseRulesPage.editRule.title'),
            value: CONST.EXPENSE_RULES.BULK_ACTION_TYPES.EDIT,
            onSelected: () => navigateToEditRulePage(selectedRules.at(0)),
        });
    }

    const headerButton = isInSelectionMode ? (
        <ButtonWithDropdownMenu
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {count: selectedRules.length})}
            isDisabled={!selectedRules.length}
            isSplitButton={false}
            onPress={() => null}
            options={headerDropdownOptions}
            shouldAlwaysShowDropdownMenu
            style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
            testID="ExpenseRulesPage-header-dropdown-menu-button"
        />
    ) : (
        <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                success
                onPress={navigateToNewRulePage}
                icon={icons.Plus}
                text={translate('expenseRulesPage.newRule')}
                style={[shouldUseNarrowLayout && styles.flex1]}
            />
        </View>
    );

    const headerContent = (
        <>
            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout && styles.workspaceSectionMobile]}>
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('expenseRulesPage.subtitle')}</Text>
            </View>
            {rulesList.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('expenseRulesPage.findRule')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={hasRules && !isLoading && filteredRuleList.length === 0}
                />
            )}
        </>
    );

    const getCustomListHeader = () =>
        !shouldUseNarrowLayout &&
        filteredRuleList.length > 0 && (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.merchant')}
                rightHeaderText={translate('common.change')}
                shouldDivideEqualWidth
                shouldShowRightCaret
            />
        );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={[styles.defaultModalContainer]}
            testID={ExpenseRulesPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                icon={!selectionModeHeader ? illustrations.Flash : undefined}
                onBackButtonPress={() => {
                    if (isMobileSelectionModeEnabled) {
                        setSelectedRules([]);
                        turnOffMobileSelectionMode();
                        return;
                    }

                    Navigation.popToSidebar();
                }}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader={!selectionModeHeader}
                title={selectionModeHeader ? translate('common.selectMultiple') : translate('expenseRulesPage.title')}
            >
                {!shouldUseNarrowLayout && headerButton}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{headerButton}</View>}
            {!hasRules && !isLoading && headerContent}
            {!hasRules && !isLoading && (
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                    <EmptyStateComponent
                        SkeletonComponent={TableListItemSkeleton}
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                        headerMedia={LottieAnimations.GenericEmptyState}
                        title={translate('expenseRulesPage.emptyRules.title')}
                        subtitle={translate('expenseRulesPage.emptyRules.subtitle')}
                        headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                        lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                        headerContentStyles={styles.emptyStateFolderWebStyles}
                    />
                </ScrollView>
            )}
            {!hasRules && isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.flex1]}
                />
            )}
            {hasRules && (
                <SelectionListWithModal
                    addBottomSafeAreaPadding
                    canSelectMultiple={canSelectMultiple}
                    customListHeader={getCustomListHeader()}
                    customListHeaderContent={headerContent}
                    data={filteredRuleList}
                    ListItem={TableListItem}
                    onCheckboxPress={toggleRule}
                    onSelectAll={filteredRuleList.length > 0 ? toggleAllRules : undefined}
                    onSelectRow={onSelectRow}
                    onTurnOnSelectionMode={(item) => item && toggleRule(item)}
                    selectedItems={selectedRules}
                    shouldHeaderBeInsideList
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    shouldShowRightCaret
                    shouldUseDefaultRightHandSideCheckmark={false}
                    showListEmptyContent={false}
                    showScrollIndicator={false}
                    style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                    turnOnSelectionModeOnLongPress={shouldUseNarrowLayout}
                />
            )}
            <ConfirmModal
                isVisible={deleteConfirmModalVisible}
                onConfirm={handleDeleteRules}
                onCancel={() => setDeleteConfirmModalVisible(false)}
                title={translate(selectedRules.length === 1 ? 'expenseRulesPage.deleteRule.deleteSingle' : 'expenseRulesPage.deleteRule.deleteMultiple')}
                prompt={translate(selectedRules.length === 1 ? 'expenseRulesPage.deleteRule.deleteSinglePrompt' : 'expenseRulesPage.deleteRule.deleteMultiplePrompt')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ScreenWrapper>
    );
}

ExpenseRulesPage.displayName = 'ExpenseRulesPage';

export default ExpenseRulesPage;
