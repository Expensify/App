import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {PersonalExpenseRuleRowData} from '@components/Tables/PersonalExpenseRulesTable';
import PersonalExpenseRulesTable from '@components/Tables/PersonalExpenseRulesTable';
import Text from '@components/Text';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearDraftRule, clearExpenseRuleErrors, deleteExpenseRules, setDraftRule} from '@libs/actions/User';
import {formatExpenseRuleChanges, getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRule} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const getKeyForList = (rule: ExpenseRule, index: number) => `${getKeyForRule(rule)}-${index}`;

function ExpenseRulesPage() {
    const {translate} = useLocalize();
    useDocumentTitle(translate('expenseRulesPage.title'));

    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const genericIllustration = useGenericEmptyStateIllustration();
    const illustrations = useMemoizedLazyIllustrations(['Flash']);
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'Plus', 'Trashcan']);
    const [expenseRules = getEmptyArray<ExpenseRule>(), expenseRulesResult] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES);

    const [selectedRules, setSelectedRules] = useState<string[]>([]);
    const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);

    useEffect(() => {
        // Clear selection when rule is changed as hash is outdated
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRules([]);
    }, [expenseRules]);

    const hasRules = expenseRules.filter((rule) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 0;
    const isLoading = !hasRules && isLoadingOnyxValue(expenseRulesResult);

    const canSelectMultiple = !shouldUseNarrowLayout || isMobileSelectionModeEnabled;
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const isInSelectionMode = shouldUseNarrowLayout ? canSelectMultiple : selectedRules.length > 0;

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

        const commentMarkdown = expenseRule.comment ? Parser.htmlToMarkdown(expenseRule.comment) : undefined;
        setDraftRule({
            ...expenseRule,
            comment: commentMarkdown,
            tax: expenseRule.tax?.field_id_TAX ? expenseRule.tax.field_id_TAX.externalID : undefined,
        });
        Navigation.navigate(ROUTES.SETTINGS_RULES_EDIT.getRoute(hash));
    };

    const handleDeleteRules = () => {
        if (selectedRules.length > 0) {
            deleteExpenseRules(expenseRules, selectedRules, getKeyForRule);
        }
        setDeleteConfirmModalVisible(false);
        turnOffMobileSelectionMode();
        setSelectedRules([]);
    };

    const personalExpenseRules: PersonalExpenseRuleRowData[] = expenseRules
        .map((rule, index) => ({
            keyForList: getKeyForList(rule, index),
            merchant: rule.merchantToMatch,
            changes: formatExpenseRuleChanges(rule, translate),
            errors: rule.errors,
            pendingAction: rule.pendingAction,
            disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            action: () => navigateToEditRulePage(getKeyForList(rule, index)),
            dismissError: () => clearExpenseRuleErrors(expenseRules, getKeyForList(rule, index), getKeyForRule),
        }))
        .filter((rule) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

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

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const headerButton = isInSelectionMode ? (
        <ButtonWithDropdownMenu
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {count: selectedRules.length})}
            isDisabled={!selectedRules.length}
            isSplitButton={false}
            onPress={() => null}
            options={headerDropdownOptions}
            shouldAlwaysShowDropdownMenu
            style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
            testID="ExpenseRulesPage-header-dropdown-menu-button"
        />
    ) : (
        <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
            <Button
                success
                onPress={navigateToNewRulePage}
                icon={icons.Plus}
                text={translate('expenseRulesPage.newRule')}
                style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_RULES.NEW_RULE}
            />
        </View>
    );

    const emptyStateComponent = (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                {...genericIllustration}
                title={translate('expenseRulesPage.emptyRules.title')}
                subtitle={translate('expenseRulesPage.emptyRules.subtitle')}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                buttons={[
                    {
                        success: true,
                        buttonAction: navigateToNewRulePage,
                        icon: icons.Plus,
                        buttonText: translate('expenseRulesPage.newRule'),
                    },
                ]}
            />
        </ScrollView>
    );

    const loadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'ExpenseRulesPage.loading',
        isLoading,
    };

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

                    Navigation.goBack();
                }}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader={!selectionModeHeader}
                shouldDisplayHelpButton
                title={selectionModeHeader ? translate('common.selectMultiple') : translate('expenseRulesPage.title')}
            >
                {!shouldDisplayButtonsInSeparateLine && hasRules && headerButton}
            </HeaderWithBackButton>
            {shouldDisplayButtonsInSeparateLine && hasRules && <View style={[styles.pl5, styles.pr5]}>{headerButton}</View>}

            {!hasRules && (
                <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout && styles.workspaceSectionMobile]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('expenseRulesPage.subtitle')}</Text>
                </View>
            )}

            {!hasRules && isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.flex1]}
                    reasonAttributes={loadingReasonAttributes}
                />
            )}

            {!isLoading && (
                <PersonalExpenseRulesTable
                    selectedKeys={selectedRules}
                    personalExpenseRules={personalExpenseRules}
                    onRowSelectionChange={setSelectedRules}
                    headerComponent={
                        hasRules ? (
                            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout && styles.workspaceSectionMobile]}>
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('expenseRulesPage.subtitle')}</Text>
                            </View>
                        ) : undefined
                    }
                    EmptyStateComponent={emptyStateComponent}
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
