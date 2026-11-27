/** Routes condition edits to the draft for the rule being edited. */
import useOnyx from '@hooks/useOnyx';

import {setDraftFlagForReviewRule, updateDraftFlagForReviewRule, updateDraftMerchantRule} from '@libs/actions/User';
import {getFlagForReviewDraftKey} from '@libs/FlagForReviewRulesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicRouteSuffix, FlagRuleConditionMode, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import type {MerchantRuleForm} from '@src/types/form/MerchantRuleForm';

import {createContext, useContext} from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

const FlagRuleConditionValuesContext = createContext<Partial<FlagForReviewRuleForm> | undefined>(undefined);

function isFlagRuleConditionMode(mode: unknown): mode is FlagRuleConditionMode {
    return mode === 'flag' || mode === CONST.RULES.DAILY_BUDGET_FILTER;
}

function useRuleConditionDraft(dynamicSuffix: DynamicRouteSuffix, policyID: string, ruleID?: string, flagCondition?: FlagRuleConditionMode, staticBackToRoute?: Route) {
    const isFlagRule = isFlagRuleConditionMode(flagCondition);
    const flagBackToRoute = ruleID && ruleID !== ROUTES.NEW ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);
    const navigation = useMerchantRuleRoute(dynamicSuffix, policyID, ruleID, staticBackToRoute ?? (isFlagRule ? flagBackToRoute : undefined));
    const formID = isFlagRule ? ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM : ONYXKEYS.FORMS.MERCHANT_RULE_FORM;
    const [storedForm] = useOnyx(formID);
    const savedConditions = useContext(FlagRuleConditionValuesContext);
    const draftKey = getFlagForReviewDraftKey(policyID, ruleID);
    const isMatchingFlagDraft = !!storedForm && 'draftKey' in storedForm && storedForm.draftKey === draftKey;
    const form = isFlagRule ? {...savedConditions, ...(isMatchingFlagDraft ? storedForm : undefined)} : storedForm;
    const updateDraft = (values: Partial<Omit<FlagForReviewRuleForm & MerchantRuleForm, 'matchType' | 'reimbursableToMatch' | 'billableToMatch'>>) => {
        if (isFlagRule && !isMatchingFlagDraft) {
            setDraftFlagForReviewRule({...values, draftKey});
        } else if (isFlagRule) {
            updateDraftFlagForReviewRule(values);
        } else {
            updateDraftMerchantRule(values);
        }
    };

    return {...navigation, form, formID, updateDraft, isFlagRule};
}

export default useRuleConditionDraft;
export {FlagRuleConditionValuesContext, isFlagRuleConditionMode};
