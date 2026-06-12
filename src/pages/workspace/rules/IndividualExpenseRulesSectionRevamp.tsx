import React from 'react';
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
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type IndividualExpenseRulesSectionRevampProps = {
    policyID: string;
    canWriteRules: boolean;
};

type BasicRuleMenuItem = {
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
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'Coins', 'Receipt', 'ReceiptCheck', 'Task', 'Cash']);

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const handleAttendeeTrackingToggle = (newValue: boolean) => {
        setPolicyAttendeeTrackingEnabled(policyID, newValue, policy?.isAttendeeTrackingEnabled);
    };

    const maxExpenseAgeText = (() => {
        if (policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', {count: policy?.maxExpenseAge ?? 0});
    })();

    const maxExpenseAmountText = (() => {
        if (policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return convertToDisplayString(policy?.maxExpenseAmount, policyCurrency);
    })();

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

    const requiredFieldsList = (() => {
        const fields: string[] = [];
        if (policy?.requiresCategory) {
            fields.push(translate('common.category'));
        }
        if (policy?.requiresTag) {
            fields.push(translate('common.tag'));
        }
        return fields.join(', ');
    })();

    const policyControlItems: BasicRuleMenuItem[] = [
        {
            title: translate('workspace.rules.generalTab.expensesOlderThan'),
            description: maxExpenseAgeText,
            icon: icons.CalendarSolid,
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAge,
        },
        {
            title: translate('workspace.rules.generalTab.expensesAboveAmount'),
            description: maxExpenseAmountText,
            icon: icons.Coins,
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmount,
        },
        {
            title: translate('workspace.rules.generalTab.flagReceiptLineItems'),
            icon: icons.Receipt,
            action: () => Navigation.navigate(ROUTES.RULES_PROHIBITED_DEFAULT.getRoute(policyID)),
        },
        {
            title: translate('workspace.rules.generalTab.receiptRequirements'),
            description: receiptRequirementText,
            icon: icons.ReceiptCheck,
            action: () => Navigation.navigate(ROUTES.RULES_REQUIRE_RECEIPTS.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoReceipt,
        },
        {
            title: translate('workspace.rules.generalTab.requireFieldsForAllExpenses'),
            description: requiredFieldsList,
            icon: icons.Task,
            action: () => Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS.getRoute(policyID)),
        },
    ];

    const productDefaultItems: BasicRuleMenuItem[] = [
        {
            title: translate('workspace.rules.generalTab.cashExpenses'),
            description: reimbursableModeText,
            icon: icons.Cash,
            action: () => Navigation.navigate(ROUTES.RULES_REIMBURSABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultReimbursable,
        },
        {
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
                key={item.title}
            >
                <MenuItem
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    iconWidth={20}
                    iconHeight={20}
                    shouldIconUseAutoWidthStyle
                    shouldShowBasicTitle
                    innerContainerStyle={{gap: 20}}
                    titleStyle={[styles.ml0, !item.description && styles.colorMuted]}
                    descriptionTextStyle={[styles.ml0, styles.breakWord]}
                    shouldShowRightIcon={canWriteRules}
                    onPress={item.action}
                    interactive={canWriteRules}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
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
                    titleStyle={styles.pv2}
                    subtitleStyle={styles.pt1}
                    isActive={areEReceiptsEnabled}
                    disabled={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD}
                    showLockIcon={!canWriteRules || policyCurrency !== CONST.CURRENCY.USD}
                    onToggle={() => (canWriteRules ? setWorkspaceEReceiptsEnabled(policyID, !areEReceiptsEnabled, policy?.eReceipts) : undefined)}
                    pendingAction={policy?.pendingFields?.eReceipts}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    subtitle={translate('workspace.rules.individualExpenseRules.attendeeTrackingHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    wrapperStyle={[styles.mt3]}
                    shouldPlaceSubtitleBelowSwitch
                    titleStyle={styles.pv2}
                    subtitleStyle={styles.pt1}
                    isActive={isAttendeeTrackingEnabledForPolicy}
                    disabled={!canWriteRules}
                    showLockIcon={!canWriteRules}
                    onToggle={() => (canWriteRules ? handleAttendeeTrackingToggle(!isAttendeeTrackingEnabledForPolicy) : undefined)}
                    pendingAction={policy?.pendingFields?.isAttendeeTrackingEnabled}
                />
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSectionRevamp;
