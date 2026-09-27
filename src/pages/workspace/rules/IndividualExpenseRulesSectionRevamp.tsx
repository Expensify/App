import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    getBillableExpensesPendingAction,
    getCashExpenseReimbursableMode,
    setPolicyAttendeeTrackingEnabled,
    setPolicyRequireCompanyCardsEnabled,
    setWorkspaceEReceiptsEnabled,
} from '@libs/actions/Policy/Policy';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import {getTagListLabel, getTagLists, hasPerTagListRequired, isAttendeeTrackingEnabled, isCollectPolicy, isMaxExpenseAmountSet, tryNavigateToControlPolicyUpgrade} from '@libs/PolicyUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';

import PublicReceiptVisibilityToggle from './PublicReceiptVisibilityToggle';

type IndividualExpenseRulesSectionRevampProps = {
    policyID: string;
    canWriteRules: boolean;
};

const RULE_MENU_ITEM_KEYS = {
    REQUIRE_FIELDS: 'requireFields',
    BILLABLE_EXPENSES: 'billableExpenses',
    EXPENSES_OLDER_THAN: 'expensesOlderThan',
    EXPENSES_ABOVE_AMOUNT: 'expensesAboveAmount',
    FLAG_RECEIPT_LINE_ITEMS: 'flagReceiptLineItems',
    RECEIPT_REQUIREMENTS: 'receiptRequirements',
    CASH_EXPENSES: 'cashExpenses',
} as const;

type BasicRuleMenuItem = {
    key: (typeof RULE_MENU_ITEM_KEYS)[keyof typeof RULE_MENU_ITEM_KEYS];
    title: string;
    description?: string;
    icon: IconAsset;
    route: Route;
    pendingAction?: PendingAction;
};

const COLLECT_ALLOWED_RULE_KEYS = new Set<string>([RULE_MENU_ITEM_KEYS.REQUIRE_FIELDS, RULE_MENU_ITEM_KEYS.BILLABLE_EXPENSES]);

function IndividualExpenseRulesSectionRevamp({policyID, canWriteRules}: IndividualExpenseRulesSectionRevampProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    // Every toggle here owes a locked-out member the read-only modal, the way the pre-revamp section gave all four of
    // them. Splitting this section out dropped it, so a member saw a lock with nothing explaining it. Only the modal is
    // taken from the hook: its `canWrite` is the `canWriteRules` prop already.
    const {withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'Coins', 'CreditCard', 'Receipt', 'ReceiptCheck', 'Task', 'Cash', 'Users', 'Eye']);

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const handleAttendeeTrackingToggle = (newValue: boolean) => {
        setPolicyAttendeeTrackingEnabled(policyID, newValue, policy?.isAttendeeTrackingEnabled);
    };

    const maxExpenseAgeText =
        policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE ? '' : translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', {count: policy?.maxExpenseAge ?? 0});

    const maxExpenseAmountText = policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE ? '' : convertToDisplayString(policy?.maxExpenseAmount, policyCurrency);

    const receiptRequirementText = (() => {
        const receiptAmount = policy?.maxExpenseAmountNoReceipt;
        const itemizedAmount = policy?.maxExpenseAmountNoItemizedReceipt;

        const isReceiptEnabled = isMaxExpenseAmountSet(receiptAmount);
        const isItemizedEnabled = isMaxExpenseAmountSet(itemizedAmount);

        return translate('workspace.rules.generalTab.receiptRequirementsSummary', {
            regularAmount: isReceiptEnabled ? convertToDisplayString(receiptAmount, policyCurrency) : undefined,
            itemizedAmount: isItemizedEnabled ? convertToDisplayString(itemizedAmount, policyCurrency) : undefined,
        });
    })();

    const reimbursableMode = getCashExpenseReimbursableMode(policy) ?? CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.REIMBURSABLE_DEFAULT;
    const reimbursableModeTextMap = {
        [CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.REIMBURSABLE_DEFAULT]: translate('workspace.rules.generalTab.cashExpensesReimbursableByDefault'),
        [CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.NON_REIMBURSABLE_DEFAULT]: translate('workspace.rules.generalTab.cashExpensesNonReimbursableByDefault'),
        [CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.ALWAYS_REIMBURSABLE]: translate('workspace.rules.generalTab.cashExpensesAlwaysReimbursable'),
        [CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.ALWAYS_NON_REIMBURSABLE]: translate('workspace.rules.generalTab.cashExpensesAlwaysNonReimbursable'),
    };
    const reimbursableModeText = reimbursableModeTextMap[reimbursableMode];
    const isBillableTrackingEnabled = policy?.disabledFields?.defaultBillable !== true;
    const billableModeText = isBillableTrackingEnabled ? translate(`workspace.rules.generalTab.${policy?.defaultBillable ? 'billableExpensesBillable' : 'billableExpensesNonBillable'}`) : '';

    const isCollect = isCollectPolicy(policy);
    const rulesUpgradeBackTo = ROUTES.WORKSPACE_RULES.getRoute(policyID);
    const rulesUpgradeAlias = CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias;

    const handleMenuItemPress = (item: BasicRuleMenuItem) => {
        // Return to the row's own page after upgrading rather than the Rules list, so the user lands where they were
        // headed — same as the GL code upgrade flow in tag settings.
        if (isCollect && !COLLECT_ALLOWED_RULE_KEYS.has(item.key) && tryNavigateToControlPolicyUpgrade(policy, rulesUpgradeAlias, item.route)) {
            return;
        }
        Navigation.navigate(item.route);
    };

    const navigateToRulesControlUpgrade = () => {
        tryNavigateToControlPolicyUpgrade(policy, rulesUpgradeAlias, rulesUpgradeBackTo);
    };

    const areEReceiptsEnabled = policy?.eReceipts ?? false;
    const isAttendeeTrackingEnabledForPolicy = isAttendeeTrackingEnabled(policy);

    // There has to be a card to require before the rule means anything, and either card product counts. Three separate
    // things can lock the row, so each gets the response that actually explains it: no write access opens the read-only
    // modal, Collect opens the upgrade the other rules use, and only a missing card product earns the More features
    // tooltip. The pre-revamp row showed that tooltip for all three, which told an auditor to enable a feature that was
    // already on.
    const requireCompanyCardsEnabled = policy?.requireCompanyCardsEnabled ?? false;
    const areAnyCardsEnabled = !!policy?.areCompanyCardsEnabled || !!policy?.areExpensifyCardsEnabled;
    const isRequireCompanyCardsLocked = !canWriteRules || isCollect || !areAnyCardsEnabled;
    const shouldExplainMissingCards = canWriteRules && !isCollect && !areAnyCardsEnabled;

    useEffect(() => {
        // The subtitle names the required tag lists, and only the Tags pages fetch them, so it would otherwise read
        // stale until Tags is opened. This section mounts only while the General tab is active.
        openPolicyTagsPage(policyID);
    }, [policyID]);

    const tagLists = getTagLists(policyTags);

    // Name the tag lists the way the Require fields page rows do, instead of a generic "Tag".
    const requiredTagLabels = (() => {
        const genericTagLabel = translate('common.tag');

        if (hasPerTagListRequired(policy, policyTags)) {
            return tagLists.filter((tagList) => tagList.required).map((tagList) => getTagListLabel(tagList.name, genericTagLabel));
        }

        if (!policy?.requiresTag) {
            return [];
        }

        // One flag covers every level, so a list name only fits when there is exactly one list.
        return [tagLists.length === 1 ? getTagListLabel(tagLists.at(0)?.name, genericTagLabel) : genericTagLabel];
    })();

    const requiredFieldsList = [policy?.requiresCategory && translate('common.category'), ...requiredTagLabels].filter(Boolean).join(', ');

    const prohibitedExpensesText = useMemo(() => {
        const prohibitedExpensesList = Object.values(CONST.POLICY.PROHIBITED_EXPENSES)
            .filter((key) => policy?.prohibitedExpenses?.[key])
            .map((key) => translate(`workspace.rules.individualExpenseRules.${key}`));

        if (!prohibitedExpensesList.length) {
            return '';
        }

        return prohibitedExpensesList.join(', ');
    }, [policy?.prohibitedExpenses, translate]);

    const policyControlItems: BasicRuleMenuItem[] = [
        {
            key: RULE_MENU_ITEM_KEYS.EXPENSES_OLDER_THAN,
            title: translate('workspace.rules.generalTab.expensesOlderThan'),
            description: maxExpenseAgeText,
            icon: icons.CalendarSolid,
            route: ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policyID),
            pendingAction: policy?.pendingFields?.maxExpenseAge,
        },
        {
            key: RULE_MENU_ITEM_KEYS.EXPENSES_ABOVE_AMOUNT,
            title: translate('workspace.rules.generalTab.expensesAboveAmount'),
            description: maxExpenseAmountText,
            icon: icons.Coins,
            route: ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID),
            pendingAction: policy?.pendingFields?.maxExpenseAmount,
        },
        {
            key: RULE_MENU_ITEM_KEYS.FLAG_RECEIPT_LINE_ITEMS,
            title: translate('workspace.rules.generalTab.flagReceiptLineItems'),
            description: prohibitedExpensesText,
            icon: icons.Receipt,
            route: ROUTES.RULES_PROHIBITED_DEFAULT.getRoute(policyID),
            pendingAction: !isEmptyObject(policy?.prohibitedExpenses?.pendingFields) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined,
        },
        {
            key: RULE_MENU_ITEM_KEYS.RECEIPT_REQUIREMENTS,
            title: translate('workspace.rules.generalTab.receiptRequirements'),
            description: receiptRequirementText,
            icon: icons.ReceiptCheck,
            route: ROUTES.RULES_REQUIRE_RECEIPTS.getRoute(policyID),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoReceipt ?? policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt,
        },
        {
            key: RULE_MENU_ITEM_KEYS.REQUIRE_FIELDS,
            title: translate('workspace.rules.generalTab.requireFieldsForAllExpenses'),
            description: requiredFieldsList,
            icon: icons.Task,
            route: ROUTES.RULES_REQUIRE_FIELDS.getRoute(policyID),
            pendingAction: policy?.pendingFields?.requiresCategory ?? policy?.pendingFields?.requiresTag,
        },
    ];

    const productDefaultItems: BasicRuleMenuItem[] = [
        {
            key: RULE_MENU_ITEM_KEYS.CASH_EXPENSES,
            title: translate('workspace.rules.generalTab.cashExpenses'),
            description: reimbursableModeText,
            icon: icons.Cash,
            route: ROUTES.RULES_REIMBURSABLE_DEFAULT.getRoute(policyID),
            pendingAction: policy?.pendingFields?.defaultReimbursable,
        },
        {
            key: RULE_MENU_ITEM_KEYS.BILLABLE_EXPENSES,
            title: translate('workspace.rules.generalTab.billableExpenses'),
            description: billableModeText,
            icon: icons.Cash,
            route: ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID),
            pendingAction: getBillableExpensesPendingAction(policy),
        },
    ];

    const renderMenuItems = (items: BasicRuleMenuItem[]) =>
        items.map((item) => (
            <OfflineWithFeedback
                pendingAction={item.pendingAction}
                key={item.key}
            >
                <MenuItem
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    iconWidth={variables.iconSizeNormal}
                    iconHeight={variables.iconSizeNormal}
                    shouldIconUseAutoWidthStyle
                    shouldShowBasicTitle
                    innerContainerStyle={styles.gap5}
                    titleStyle={[styles.ml0, !item.description && styles.colorMuted]}
                    descriptionTextStyle={[styles.ml0, styles.breakWord]}
                    shouldShowRightIcon={canWriteRules}
                    onPress={() => handleMenuItemPress(item)}
                    interactive={canWriteRules}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.INDIVIDUAL_EXPENSES_MENU_ITEM}
                    numberOfLinesDescription={1}
                />
            </OfflineWithFeedback>
        ));

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.generalTab.title')}
            subtitle={translate('workspace.rules.generalTab.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
            subtitleStyles={styles.mt0}
            containerStyles={styles.mh5}
        >
            <View style={styles.mt3}>
                {renderMenuItems(policyControlItems)}
                <View style={[styles.sectionDividerLine, styles.mv3]} />
                {renderMenuItems(productDefaultItems)}
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.requireCompanyCard')}
                    subtitle={translate('workspace.rules.individualExpenseRules.requireCompanyCardDescription')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.requireCompanyCard')}
                    wrapperStyle={[styles.pv3]}
                    isActive={requireCompanyCardsEnabled}
                    disabled={isRequireCompanyCardsLocked}
                    showLockIcon={isRequireCompanyCardsLocked}
                    disabledText={shouldExplainMissingCards ? translate('workspace.rules.individualExpenseRules.requireCompanyCardDisabledTooltip') : undefined}
                    disabledAction={withReadOnlyFallback(isCollect ? navigateToRulesControlUpgrade : undefined)}
                    onToggle={() => (canWriteRules && policy ? setPolicyRequireCompanyCardsEnabled(policy, !requireCompanyCardsEnabled) : undefined)}
                    pendingAction={policy?.pendingFields?.requireCompanyCardsEnabled}
                    rowIcon={icons.CreditCard}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    subtitle={translate('workspace.rules.individualExpenseRules.eReceiptsHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    shouldParseSubtitle
                    wrapperStyle={[styles.pv3]}
                    isActive={areEReceiptsEnabled}
                    disabled={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD || isCollect}
                    showLockIcon={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD || isCollect}
                    disabledAction={withReadOnlyFallback(isCollect ? navigateToRulesControlUpgrade : undefined)}
                    onToggle={() => (canWriteRules ? setWorkspaceEReceiptsEnabled(policyID, !areEReceiptsEnabled, policy?.eReceipts) : undefined)}
                    pendingAction={policy?.pendingFields?.eReceipts}
                    rowIcon={icons.Receipt}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    subtitle={translate('workspace.rules.individualExpenseRules.attendeeTrackingHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    wrapperStyle={[styles.pv3]}
                    isActive={isAttendeeTrackingEnabledForPolicy}
                    disabled={!canWriteRules || isCollect}
                    showLockIcon={!canWriteRules || isCollect}
                    disabledAction={withReadOnlyFallback(isCollect ? navigateToRulesControlUpgrade : undefined)}
                    onToggle={() => (canWriteRules ? handleAttendeeTrackingToggle(!isAttendeeTrackingEnabledForPolicy) : undefined)}
                    pendingAction={policy?.pendingFields?.isAttendeeTrackingEnabled}
                    rowIcon={icons.Users}
                />
                <PublicReceiptVisibilityToggle
                    policyID={policyID}
                    canWriteRules={canWriteRules}
                    withReadOnlyFallback={withReadOnlyFallback}
                    rowIcon={icons.Eye}
                />
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSectionRevamp;
