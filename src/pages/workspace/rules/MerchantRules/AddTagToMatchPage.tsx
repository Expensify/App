import useLoadPolicyTags from '@hooks/useLoadPolicyTags';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName, getTagLists} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {Str} from 'expensify-common';
import React from 'react';

import type {RuleConditionItem} from './RuleConditionMultiSelectPage';

import RuleConditionMultiSelectPage from './RuleConditionMultiSelectPage';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddTagToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_TAG_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_TAG_TO_MATCH>;

type TagOption = RuleConditionItem & {
    tagName: string;
    tagLevel?: number;
};

function getTagOptionValue(name: string, level: number | undefined): string {
    return level === undefined ? name : JSON.stringify([level, name]);
}

function AddTagToMatchPage({route}: AddTagToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute, form, updateDraft, isFlagRule} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_TAG_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        'flagCondition' in route.params ? route.params.flagCondition : undefined,
    );
    const {translate} = useLocalize();
    const {isLoadingPolicyTags} = useLoadPolicyTags(policyID);
    const [policyTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {selector: getTagLists});

    const isDailyBudget = !!form && 'dailyBudgetToMatch' in form && !!form.dailyBudgetToMatch;
    const savedBudgetTagLevel = form && 'budgetTagLevel' in form ? form.budgetTagLevel : undefined;
    const savedTags = isDailyBudget === !!savedBudgetTagLevel ? (form?.tagsToMatch ?? []) : [];
    const savedTagLevel = isDailyBudget ? savedBudgetTagLevel : undefined;
    const draftValues = savedTags.map((name) => getTagOptionValue(name, savedTagLevel));

    // Ordinary tags share a row for the same name. Daily budgets match the exact tag in one list.
    const options = new Map<string, TagOption>();
    for (const tagList of policyTagLists ?? []) {
        const tagLevel = isDailyBudget ? tagList.orderWeight + 1 : undefined;
        const alternateText = tagLevel ? `${tagList.name} (${translate('insightsPage.tagLevel', String(tagLevel))})` : undefined;
        for (const tag of Object.values(tagList.tags ?? {})) {
            // Auth splits the stored path before comparing the exact tag at this level.
            const tagName = isDailyBudget ? tag.name.replaceAll(/\\([\\:])/g, '$1') : tag.name;
            const value = getTagOptionValue(tagName, tagLevel);
            const isPendingBudgetTag = isDailyBudget && (tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !!tag.pendingFields?.name);
            const isUnavailable = !tag.enabled || tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isPendingBudgetTag;
            if (options.has(value) || (isUnavailable && !draftValues.includes(value))) {
                continue;
            }
            const text = isDailyBudget ? Str.htmlDecode(tagName) : getCleanedTagName(tagName);
            options.set(value, {value, tagName, tagLevel, text, alternateText});
        }
    }

    // The rule still matches a removed tag until the admin clears it.
    for (const tagName of savedTags) {
        const value = getTagOptionValue(tagName, savedTagLevel);
        if (!options.has(value)) {
            const text = isDailyBudget ? Str.htmlDecode(tagName) : getCleanedTagName(tagName);
            options.set(value, {value, tagName, tagLevel: savedTagLevel, text});
        }
    }

    const saveTags = (values: string[]) => {
        if (!isDailyBudget) {
            updateDraft({tagsToMatch: values, ...(isFlagRule ? {budgetTagLevel: 0} : {})});
            return;
        }
        const selected = options.get(values.at(0) ?? '');
        updateDraft({tagsToMatch: selected ? [selected.tagName] : [], budgetTagLevel: selected?.tagLevel ?? 0});
    };

    return (
        <RuleConditionMultiSelectPage
            draftValues={draftValues}
            isSingleSelection={isDailyBudget}
            shouldAlwaysShowSearch
            title={translate('common.tag')}
            testID="AddTagToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.TAG_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={Array.from(options.values())}
            isLoading={isLoadingPolicyTags}
            onSave={saveTags}
        />
    );
}

export default withFlagRuleConditionAccess(AddTagToMatchPage);
