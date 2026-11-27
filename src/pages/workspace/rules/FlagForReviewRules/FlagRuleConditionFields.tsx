/** Shows the flag editor's shared expense condition pickers. */
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useExpenseDefaultConditionNames from '@hooks/useExpenseDefaultConditionNames';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {getTaxRateDisplayName, hasUsableTaxRates} from '@libs/CategoryTaxRulesUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {getMerchantTypeLabel} from '@libs/ExpenseDefaultRuleUtils';
import {getFlagTagDisplayName} from '@libs/FlagForReviewRulesUtils';
import {getDateComparisonText, getHasConditionText} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import {parseAmountFilterValue} from '@libs/SearchAmountFilterUtils';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type FlagConditionFieldProps = WithRequiredSentryLabel & {
    name: string;
    value?: string;
    icon: IconAsset;
    route?: Route;
};

function FlagConditionField({name, value, icon, route, sentryLabel}: FlagConditionFieldProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    return (
        <MenuItem.Root
            onPress={route ? callIfAuthenticated(() => Navigation.navigate(route), session) : undefined}
            sentryLabel={sentryLabel}
            accessibilityLabel={[name, value].filter(Boolean).join(', ')}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <MenuItem.IconNarrow src={icon} />
                </MenuItem.Leading>
                <MenuItemField.Content name={name}>{!!value && <MenuItem.FieldValue numberOfLines={2}>{value}</MenuItem.FieldValue>}</MenuItemField.Content>
                {!!route && (
                    <MenuItem.Trailing>
                        <MenuItem.Chevron />
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

type FlagRuleConditionFieldsProps = {
    policyID: string;
    ruleID?: string;
    canEdit: boolean;
    form?: Partial<FlagForReviewRuleForm>;
};

const LABELS = CONST.SENTRY_LABEL.WORKSPACE.RULES;
const EQ = CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;

function FlagRuleConditionFields({policyID, ruleID, canEdit, form}: FlagRuleConditionFieldsProps) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {submitters, cards, areCardsLoaded} = useExpenseDefaultConditionNames(policy, !!form?.cardsToMatch?.length);
    const icons = useMemoizedLazyExpensifyIcons(['Basket', 'Calendar', 'Cash', 'CreditCard', 'InvoiceGeneric', 'Paperclip', 'Paycheck', 'Tag']);
    const budget = form?.dailyBudgetToMatch ? parseAmountFilterValue(form.dailyBudgetToMatch) : undefined;
    const getBooleanValue = (value: boolean | '' | undefined) => (typeof value === 'boolean' ? translate(value ? 'common.yes' : 'common.no') : undefined);

    return (
        <>
            <FlagConditionField
                name={translate('common.submitter')}
                value={form?.submittersToMatch?.map((id) => submitters?.[id] ?? translate('common.hidden')).join(', ') || translate('common.any')}
                icon={icons.Paycheck}
                route={canEdit ? ROUTES.RULES_SUBMITTER_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_SUBMITTER}
            />
            <FlagConditionField
                name={translate('workspace.rules.flagForReviewRule.dailyBudget')}
                value={
                    budget?.currency
                        ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: convertToDisplayString(convertToBackendAmount(Number(budget.amount)), budget.currency)})
                        : undefined
                }
                icon={icons.Cash}
                route={canEdit ? ROUTES.RULES_AMOUNT_TO_MATCH.getRoute(policyID, ruleID, CONST.RULES.DAILY_BUDGET_FILTER) : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_DAILY_BUDGET}
            />
            <FlagConditionField
                name={translate('workspace.rules.merchantTypeRule.merchantType')}
                value={form?.merchantTypesToMatch?.map((type) => getMerchantTypeLabel(type, translate)).join(', ')}
                icon={icons.Basket}
                route={canEdit ? ROUTES.RULES_MERCHANT_TYPE_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_MERCHANT_TYPE}
            />
            {(!!policy?.areTagsEnabled || !!form?.tagsToMatch?.length) && (
                <FlagConditionField
                    name={translate('common.tag')}
                    value={form?.tagsToMatch?.map((tag) => getFlagTagDisplayName(tag, translate, budget ? form.budgetTagLevel : undefined)).join(', ')}
                    icon={icons.Tag}
                    route={canEdit ? ROUTES.RULES_TAG_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                    sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_TAG}
                />
            )}
            <FlagConditionField
                name={translate('common.reimbursable')}
                value={getBooleanValue(form?.reimbursableToMatch)}
                icon={icons.Paycheck}
                route={canEdit ? ROUTES.RULES_REIMBURSABLE_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_REIMBURSABLE}
            />
            {(policy?.disabledFields?.defaultBillable !== true || typeof form?.billableToMatch === 'boolean') && (
                <FlagConditionField
                    name={translate('common.billable')}
                    value={getBooleanValue(form?.billableToMatch)}
                    icon={icons.Paycheck}
                    route={canEdit ? ROUTES.RULES_BILLABLE_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                    sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_BILLABLE}
                />
            )}
            <FlagConditionField
                name={translate('common.date')}
                value={form?.dateToMatch ? getDateComparisonText(form.dateToMatch, form.dateMatchType ?? EQ, translate) : undefined}
                icon={icons.Calendar}
                route={canEdit ? ROUTES.RULES_DATE_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_DATE}
            />
            <FlagConditionField
                name={translate('common.currency')}
                value={form?.currenciesToMatch?.join(', ')}
                icon={icons.Cash}
                route={canEdit ? ROUTES.RULES_CURRENCY_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_CURRENCY}
            />
            {(!!policy?.areExpensifyCardsEnabled || !!policy?.areCompanyCardsEnabled || !!form?.cardsToMatch?.length) && (
                <FlagConditionField
                    name={translate('common.card')}
                    value={form?.cardsToMatch?.map((id) => cards?.[id] ?? (areCardsLoaded ? translate('workspace.companyCards.deletedCard') : id)).join(', ')}
                    icon={icons.CreditCard}
                    route={canEdit ? ROUTES.RULES_CARD_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                    sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_CARD}
                />
            )}
            {(hasUsableTaxRates(policy) || !!form?.taxRatesToMatch?.length) && (
                <FlagConditionField
                    name={translate('workspace.taxes.taxRate')}
                    value={form?.taxRatesToMatch?.map((id) => getTaxRateDisplayName(policy, id)).join(', ')}
                    icon={icons.InvoiceGeneric}
                    route={canEdit ? ROUTES.RULES_TAX_RATE_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                    sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_TAX_RATE}
                />
            )}
            <FlagConditionField
                name={translate('workspace.rules.merchantRules.hasOrDoesNotHave')}
                value={form?.hasToMatch?.length ? getHasConditionText(form.hasToMatch, form.hasMatchType ?? EQ, translate) : undefined}
                icon={icons.Paperclip}
                route={canEdit ? ROUTES.RULES_HAS_TO_MATCH.getRoute(policyID, ruleID, 'flag') : undefined}
                sentryLabel={LABELS.FLAG_FOR_REVIEW_RULE_HAS}
            />
        </>
    );
}

export default FlagRuleConditionFields;
