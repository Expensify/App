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
import {getCashExpenseReimbursableMode} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type IndividualExpenseRulesSectionProps = {
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

function IndividualExpenseRulesSection({policyID, canWriteRules}: IndividualExpenseRulesSectionProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Calendar', 'Coins', 'Flag', 'ReceiptScan', 'Filter', 'CreditCard', 'Users', 'EReceiptIcon']);

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const maxExpenseAgeText = useMemo(() => {
        if (policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', {count: policy?.maxExpenseAge ?? 0});
    }, [policy?.maxExpenseAge, translate]);

    const maxExpenseAmountText = useMemo(() => {
        if (policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return convertToDisplayString(policy?.maxExpenseAmount, policyCurrency);
    }, [convertToDisplayString, policy?.maxExpenseAmount, policyCurrency]);

    const receiptRequirementText = useMemo(() => {
        const amount = policy?.maxExpenseAmountNoReceipt;
        if (amount === CONST.DISABLED_MAX_EXPENSE_VALUE || amount === undefined) {
            return '';
        }
        return convertToDisplayString(amount, policyCurrency);
    }, [convertToDisplayString, policy?.maxExpenseAmountNoReceipt, policyCurrency]);

    const reimbursableMode = getCashExpenseReimbursableMode(policy) ?? CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.REIMBURSABLE_DEFAULT;
    const reimbursableModeText = translate(`workspace.rules.individualExpenseRules.${reimbursableMode}`);
    const billableModeText = translate(`workspace.rules.individualExpenseRules.${policy?.defaultBillable ? 'billable' : 'nonBillable'}`);

    const areEReceiptsEnabled = policy?.eReceipts ?? false;
    const isAttendeeTrackingEnabledForPolicy = isAttendeeTrackingEnabled(policy);

    const requiredFieldsList = useMemo(() => {
        const fields: string[] = [];
        if (policy?.requiresCategory) {
            fields.push(translate('common.category'));
        }
        if (policy?.requiresTag) {
            fields.push(translate('common.tag'));
        }
        return fields.join(', ');
    }, [policy?.requiresCategory, policy?.requiresTag, translate]);

    const policyControlItems: BasicRuleMenuItem[] = [
        {
            title: translate('workspace.rules.generalTab.expensesOlderThan'),
            description: maxExpenseAgeText,
            icon: icons.Calendar,
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
            icon: icons.Flag,
            action: () => Navigation.navigate(ROUTES.RULES_PROHIBITED_DEFAULT.getRoute(policyID)),
        },
        {
            title: translate('workspace.rules.generalTab.receiptRequirements'),
            description: receiptRequirementText,
            icon: icons.ReceiptScan,
            action: () => Navigation.navigate(ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoReceipt,
        },
        {
            title: translate('workspace.rules.generalTab.requireFieldsForAllExpenses'),
            description: requiredFieldsList,
            icon: icons.Filter,
            // TODO: Navigate to a dedicated RHP page for required fields
            action: () => {},
        },
    ];

    const productDefaultItems: BasicRuleMenuItem[] = [
        {
            title: translate('workspace.rules.generalTab.cashExpenses'),
            description: reimbursableModeText,
            icon: icons.CreditCard,
            action: () => Navigation.navigate(ROUTES.RULES_REIMBURSABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultReimbursable,
        },
        {
            title: translate('workspace.rules.generalTab.billableExpenses'),
            description: billableModeText,
            icon: icons.CreditCard,
            action: () => Navigation.navigate(ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultBillable,
        },
        {
            title: translate('workspace.rules.generalTab.trackAttendees'),
            description: isAttendeeTrackingEnabledForPolicy ? translate('common.enabled') : '',
            icon: icons.Users,
            // TODO: Navigate to a dedicated RHP page for attendee tracking
            action: () => {},
            pendingAction: policy?.pendingFields?.isAttendeeTrackingEnabled,
        },
        {
            title: translate('workspace.rules.generalTab.autoCreateEReceipts'),
            description: areEReceiptsEnabled ? translate('workspace.rules.generalTab.autoCreateEReceiptsDescription') : '',
            icon: icons.EReceiptIcon,
            // TODO: Navigate to a dedicated RHP page for eReceipts
            action: () => {},
            pendingAction: policy?.pendingFields?.eReceipts,
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
                    innerContainerStyle={{gap: 20}}
                    titleStyle={styles.ml0}
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
            subtitleStyles={styles.mt1}
        >
            <View style={styles.mt3}>
                {renderMenuItems(policyControlItems)}
                <View style={[styles.sectionDividerLine, styles.mv3]} />
                {renderMenuItems(productDefaultItems)}
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSection;
