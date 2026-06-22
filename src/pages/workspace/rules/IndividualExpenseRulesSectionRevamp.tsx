import React, {useMemo} from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCashExpenseReimbursableMode, setPolicyAttendeeTrackingEnabled, setWorkspaceEReceiptsEnabled} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type IndividualExpenseRulesSectionRevampProps = {
    policyID: string;
    canWriteRules: boolean;
};

type BasicRuleMenuItem = {
    key: string;
    title: string;
    description?: string;
    icon: IconAsset;
    action: () => void;
    pendingAction?: PendingAction;
};

function IndividualExpenseRulesSectionRevamp({policyID, canWriteRules}: IndividualExpenseRulesSectionRevampProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'Coins', 'Receipt', 'ReceiptCheck', 'Task', 'Cash', 'Users']);

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

        const isReceiptEnabled = receiptAmount !== undefined && receiptAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE && receiptAmount !== 0;
        const isItemizedEnabled = itemizedAmount !== undefined && itemizedAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE && itemizedAmount !== 0;

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
    const billableModeText = translate(`workspace.rules.generalTab.${policy?.defaultBillable ? 'billableExpensesBillable' : 'billableExpensesNonBillable'}`);

    const areEReceiptsEnabled = policy?.eReceipts ?? false;
    const isAttendeeTrackingEnabledForPolicy = isAttendeeTrackingEnabled(policy);

    const requiredFieldsList = [policy?.requiresCategory && translate('common.category'), policy?.requiresTag && translate('common.tag')].filter(Boolean).join(', ');

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
            key: 'expensesOlderThan',
            title: translate('workspace.rules.generalTab.expensesOlderThan'),
            description: maxExpenseAgeText,
            icon: icons.CalendarSolid,
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAge,
        },
        {
            key: 'expensesAboveAmount',
            title: translate('workspace.rules.generalTab.expensesAboveAmount'),
            description: maxExpenseAmountText,
            icon: icons.Coins,
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmount,
        },
        {
            key: 'flagReceiptLineItems',
            title: translate('workspace.rules.generalTab.flagReceiptLineItems'),
            description: prohibitedExpensesText,
            icon: icons.Receipt,
            action: () => Navigation.navigate(ROUTES.RULES_PROHIBITED_DEFAULT.getRoute(policyID)),
            pendingAction: !isEmptyObject(policy?.prohibitedExpenses?.pendingFields) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined,
        },
        {
            key: 'receiptRequirements',
            title: translate('workspace.rules.generalTab.receiptRequirements'),
            description: receiptRequirementText,
            icon: icons.ReceiptCheck,
            action: () => Navigation.navigate(ROUTES.RULES_REQUIRE_RECEIPTS.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoReceipt ?? policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt,
        },
        {
            key: 'requireFields',
            title: translate('workspace.rules.generalTab.requireFieldsForAllExpenses'),
            description: requiredFieldsList,
            icon: icons.Task,
            action: () => Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.requiresCategory ?? policy?.pendingFields?.requiresTag,
        },
    ];

    const productDefaultItems: BasicRuleMenuItem[] = [
        {
            key: 'cashExpenses',
            title: translate('workspace.rules.generalTab.cashExpenses'),
            description: reimbursableModeText,
            icon: icons.Cash,
            action: () => Navigation.navigate(ROUTES.RULES_REIMBURSABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultReimbursable,
        },
        {
            key: 'billableExpenses',
            title: translate('workspace.rules.generalTab.billableExpenses'),
            description: billableModeText,
            icon: icons.Cash,
            action: () => Navigation.navigate(ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultBillable,
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
                    onPress={item.action}
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
                    title={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    subtitle={translate('workspace.rules.individualExpenseRules.eReceiptsHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    shouldParseSubtitle
                    wrapperStyle={[styles.mt3]}
                    shouldPlaceSubtitleBelowSwitch
                    shouldUseCompactSubtitleSpacing
                    isActive={areEReceiptsEnabled}
                    disabled={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD}
                    showLockIcon={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD}
                    onToggle={() => (canWriteRules ? setWorkspaceEReceiptsEnabled(policyID, !areEReceiptsEnabled, policy?.eReceipts) : undefined)}
                    pendingAction={policy?.pendingFields?.eReceipts}
                    rowIcon={icons.Receipt}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    subtitle={translate('workspace.rules.individualExpenseRules.attendeeTrackingHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    wrapperStyle={[styles.mt3]}
                    shouldPlaceSubtitleBelowSwitch
                    shouldUseCompactSubtitleSpacing
                    isActive={isAttendeeTrackingEnabledForPolicy}
                    disabled={!canWriteRules}
                    showLockIcon={!canWriteRules}
                    onToggle={() => (canWriteRules ? handleAttendeeTrackingToggle(!isAttendeeTrackingEnabledForPolicy) : undefined)}
                    pendingAction={policy?.pendingFields?.isAttendeeTrackingEnabled}
                    rowIcon={icons.Users}
                />
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSectionRevamp;
