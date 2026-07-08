import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import Tab from '@libs/actions/Tab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import RulesCardRestrictionsTab from './tabs/RulesCardRestrictionsTab';
import RulesExpenseDefaultsTab from './tabs/RulesExpenseDefaultsTab';
import RulesFlagForReviewTab from './tabs/RulesFlagForReviewTab';
import RulesGeneralTab from './tabs/RulesGeneralTab';
import RulesRequireFieldsTab from './tabs/RulesRequireFieldsTab';
import useRulesTableBulkActions from './tabs/useRulesTableBulkActions';

const RULES_TAB = CONST.TAB.RULES;

type RulesTab = ValueOf<typeof RULES_TAB>;

const RULES_TAB_VALUES = new Set<string>(Object.values(RULES_TAB));

function isRulesTab(key: string): key is RulesTab {
    return RULES_TAB_VALUES.has(key);
}

function isTableSelectionTab(tab: RulesTab): tab is Exclude<RulesTab, typeof RULES_TAB.GENERAL> {
    return tab !== RULES_TAB.GENERAL;
}

function updateSelectionKeysIfChanged(previousKeys: string[], nextKeys: string[]) {
    if (previousKeys.length === nextKeys.length && previousKeys.every((key, index) => key === nextKeys.at(index))) {
        return previousKeys;
    }

    return nextKeys;
}

type PolicyRulesPageRevampProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

const agentsRulesBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.AGENTS_RULES_BANNER];

function PolicyRulesPageRevamp({route}: PolicyRulesPageRevampProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Flash']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'DocumentMagicWand', 'Task', 'Flag', 'Trashcan', 'Table']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RULES_TAB_TYPE}`);
    const lastSelectedTabStr = lastSelectedTab as string | undefined;
    const activeTab: RulesTab = lastSelectedTabStr && isRulesTab(lastSelectedTabStr) ? lastSelectedTabStr : RULES_TAB.GENERAL;
    const [selectedRuleKeysByTab, setSelectedRuleKeysByTab] = useState<Partial<Record<Exclude<RulesTab, typeof RULES_TAB.GENERAL>, string[]>>>({});

    const {showConfirmModal} = useConfirmModal();

    useEffect(() => {
        // Fetch once on mount (and when policyID changes). setPolicyCodingRule already updates Onyx — refetching after saves can overwrite a newly added rule with stale data.
        openPolicyRulesPage(policyID);
    }, [policyID]);

    const clearAllTableSelection = useCallback(() => {
        setSelectedRuleKeysByTab((prev) => (Object.keys(prev).length > 0 ? {} : prev));
        turnOffMobileSelectionMode();
    }, []);

    useCleanupSelectedOptions(clearAllTableSelection);

    const clearTableSelection = useCallback(() => {
        if (!isTableSelectionTab(activeTab)) {
            return;
        }

        setSelectedRuleKeysByTab((prev) => {
            if (!prev[activeTab]?.length) {
                return prev;
            }

            return {...prev, [activeTab]: []};
        });
        turnOffMobileSelectionMode();
    }, [activeTab]);

    const updateTabSelectionKeys = useCallback((tab: Exclude<RulesTab, typeof RULES_TAB.GENERAL>, selectedRowKeys: string[]) => {
        setSelectedRuleKeysByTab((prev) => {
            const nextKeys = updateSelectionKeysIfChanged(prev[tab] ?? [], selectedRowKeys);
            if (prev[tab] === nextKeys) {
                return prev;
            }

            return {...prev, [tab]: nextKeys};
        });
    }, []);

    const handleSpendRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.CARD_RESTRICTIONS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleExpenseDefaultSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.EXPENSE_DEFAULTS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleRequireFieldsRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.REQUIRE_FIELDS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleFlagForReviewRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.FLAG_FOR_REVIEW, selectedRowKeys), [updateTabSelectionKeys]);

    const {selectedRuleKeys, getFilteredSelectedKeys, deleteSelectedForActiveTab} = useRulesTableBulkActions({
        policyID,
        activeTab,
        selectedRuleKeysByTab,
        canWriteRules,
        clearTableSelection,
    });

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const hasSelectedRules = selectedRuleKeys.length > 0;
    const isTableTab =
        activeTab === RULES_TAB.CARD_RESTRICTIONS || activeTab === RULES_TAB.EXPENSE_DEFAULTS || activeTab === RULES_TAB.REQUIRE_FIELDS || activeTab === RULES_TAB.FLAG_FOR_REVIEW;
    const shouldShowBulkActions = canWriteRules && isTableTab && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : hasSelectedRules);
    const shouldShowAddRuleButton = activeTab === RULES_TAB.GENERAL || !shouldShowBulkActions;

    const handleBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            clearTableSelection();
            return;
        }

        Navigation.goBack();
    };

    const getBulkActionsButtonOptions = (): Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> => {
        return [
            {
                icon: icons.Trashcan,
                text: translate('workspace.rules.bulkActions.deleteMultiple', {count: selectedRuleKeys.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    const {action} = await showConfirmModal({
                        title: translate('workspace.rules.merchantRules.deleteRule'),
                        prompt: translate('workspace.rules.bulkActions.deleteMultipleConfirmation', {count: selectedRuleKeys.length}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (action !== ModalActions.CONFIRM) {
                        return;
                    }

                    deleteSelectedForActiveTab();
                },
            },
        ];
    };

    const tabs: TabSelectorBaseItem[] = [
        {
            key: RULES_TAB.GENERAL,
            title: translate('workspace.rules.tabs.general'),
            icon: icons.Feed,
        },
        {
            key: RULES_TAB.CARD_RESTRICTIONS,
            title: translate('workspace.rules.tabs.cardRestrictions'),
            icon: icons.CreditCardExclamation,
        },
        {
            key: RULES_TAB.EXPENSE_DEFAULTS,
            title: translate('workspace.rules.tabs.expenseDefaults'),
            icon: icons.DocumentMagicWand,
        },
        {
            key: RULES_TAB.REQUIRE_FIELDS,
            title: translate('workspace.rules.tabs.requireFields'),
            icon: icons.Task,
        },
        {
            key: RULES_TAB.FLAG_FOR_REVIEW,
            title: translate('workspace.rules.tabs.flagForReview'),
            icon: icons.Flag,
        },
    ];

    const handleNewRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_NEW.getRoute(policyID));
    };

    const getHeaderContent = () => {
        if (shouldShowBulkActions) {
            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedRuleKeys.length})}
                    options={getBulkActionsButtonOptions()}
                    isSplitButton={false}
                    style={[shouldDisplayButtonsInSeparateLine && styles.w100, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    isDisabled={!selectedRuleKeys.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.BULK_ACTIONS_DROPDOWN}
                />
            );
        }

        if (!shouldShowAddRuleButton) {
            return null;
        }

        const addRuleButton = (
            <Button
                success
                onPress={handleNewRule}
                text={translate('workspace.rules.merchantRules.addRuleTitle')}
                icon={icons.Plus}
                style={[shouldDisplayButtonsInSeparateLine && styles.w100]}
            />
        );

        if (activeTab !== RULES_TAB.EXPENSE_DEFAULTS) {
            return addRuleButton;
        }

        const moreOptions: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>>> = [
            {
                icon: icons.Table,
                text: translate('workspace.rules.merchantRules.importRulesViaSpreadsheet'),
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
                onSelected: () => {
                    if (!canWriteRules) {
                        showReadOnlyModal();
                        return;
                    }
                    Navigation.navigate(ROUTES.RULES_MERCHANT_IMPORT.getRoute(policyID));
                },
            },
        ];

        return (
            <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.w100]}>
                {addRuleButton}
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={moreOptions}
                    isSplitButton={false}
                    containerStyles={{width: variables.popoverWidth}}
                    wrapperStyle={styles.flexGrow0}
                />
            </View>
        );
    };

    const headerButtons = getHeaderContent();
    const sharedTableTabProps = {
        policyID,
        canWriteRules,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <WorkspacePageWithSections
                testID="PolicyRulesPage"
                shouldUseScrollView={activeTab === RULES_TAB.GENERAL}
                headerText={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.rules')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={selectionModeHeader ? undefined : illustrations.Flash}
                shouldUseHeadlineHeader={!selectionModeHeader}
                onBackButtonPress={handleBackButtonPress}
                policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
                headerContent={!shouldDisplayButtonsInSeparateLine && headerButtons}
            >
                <View style={[styles.flex1, styles.w100, styles.mnh0]}>
                    <View style={[styles.flexShrink0, styles.w100]}>
                        <View style={[styles.flexRow, styles.mb1, styles.w100]}>
                            <TabSelectorContextProvider activeTabKey={activeTab}>
                                <TabSelectorBase
                                    tabs={tabs}
                                    activeTabKey={activeTab}
                                    onTabPress={(key) => {
                                        if (!isRulesTab(key)) {
                                            return;
                                        }
                                        setSelectedRuleKeysByTab({});
                                        turnOffMobileSelectionMode();
                                        Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, key);
                                    }}
                                />
                            </TabSelectorContextProvider>
                        </View>
                    </View>
                    {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.flexShrink0, styles.pl5, styles.pr5, styles.pb5, styles.w100]}>{headerButtons}</View>}
                    <View style={[styles.flex1, styles.mnh0, styles.w100, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, isTableTab && styles.mw100]}>
                        {activeTab === RULES_TAB.GENERAL && (
                            <RulesGeneralTab
                                policyID={policyID}
                                canWriteRules={canWriteRules}
                                isAgentsRulesBannerDismissed={isAgentsRulesBannerDismissed}
                            />
                        )}
                        {isTableTab && (
                            <View style={[styles.flex1, styles.mnh0]}>
                                {activeTab === RULES_TAB.CARD_RESTRICTIONS && (
                                    <RulesCardRestrictionsTab
                                        {...sharedTableTabProps}
                                        selectedKeys={getFilteredSelectedKeys(RULES_TAB.CARD_RESTRICTIONS)}
                                        onSelectionChange={handleSpendRuleSelectionChange}
                                    />
                                )}
                                {activeTab === RULES_TAB.EXPENSE_DEFAULTS && (
                                    <RulesExpenseDefaultsTab
                                        {...sharedTableTabProps}
                                        selectedKeys={getFilteredSelectedKeys(RULES_TAB.EXPENSE_DEFAULTS)}
                                        onSelectionChange={handleExpenseDefaultSelectionChange}
                                    />
                                )}
                                {activeTab === RULES_TAB.REQUIRE_FIELDS && (
                                    <RulesRequireFieldsTab
                                        {...sharedTableTabProps}
                                        selectedKeys={getFilteredSelectedKeys(RULES_TAB.REQUIRE_FIELDS)}
                                        onSelectionChange={handleRequireFieldsRuleSelectionChange}
                                        showReadOnlyModal={showReadOnlyModal}
                                    />
                                )}
                                {activeTab === RULES_TAB.FLAG_FOR_REVIEW && (
                                    <RulesFlagForReviewTab
                                        {...sharedTableTabProps}
                                        selectedKeys={getFilteredSelectedKeys(RULES_TAB.FLAG_FOR_REVIEW)}
                                        onSelectionChange={handleFlagForReviewRuleSelectionChange}
                                        showReadOnlyModal={showReadOnlyModal}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPageRevamp;
