import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName, getTagLists} from '@libs/PolicyUtils';
import {trimTag} from '@libs/TagUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ValueOf} from 'type-fest';

import React, {useMemo} from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddTagPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAG | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAG>;

function AddTagPage({route}: AddTagPageProps) {
    const {policyID, ruleID, orderWeight} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_TAG_FROM_EXPENSE.path, policyID, ruleID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyTags = getEmptyArray<ValueOf<PolicyTagLists>>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {selector: getTagLists});
    const hasDependentTags = policyTags.some((tagList) => Object.values(tagList.tags).some((tag) => !!tag.rules?.parentTagsFilter || !!tag.parentTagsFilter));
    const tagList = policyTags.find((item) => item.orderWeight === orderWeight);
    const formTags = getTagArrayFromName(form?.tag ?? '');
    const formTag = formTags.at(orderWeight);

    const tagItems = useMemo(() => {
        const tags: Array<{name: string; value: string}> = [];

        for (const tag of Object.values(tagList?.tags ?? {})) {
            if (tag.name !== formTag && !tag.enabled) {
                continue;
            }
            tags.push({name: getCleanedTagName(tag.name), value: tag.name});
        }

        return tags;
    }, [tagList?.tags, formTag]);

    const selectedTagItem = tagItems.find(({value}) => value === formTag);

    const onSave = (value?: string) => {
        const newTags = [...formTags];
        if (hasDependentTags) {
            newTags.splice(orderWeight, newTags.length - orderWeight, value ?? '');
        } else {
            newTags[orderWeight] = value ?? '';
        }
        updateDraftMerchantRule({tag: trimTag(newTags.join(':'))});
    };

    return (
        <RuleSelectionBase
            titleKey="common.tag"
            title={tagList?.name}
            testID="AddTagPage"
            onBack={() => Navigation.goBack(backToRoute)}
        >
            <RuleSelectionBase.Picker
                selectedItem={selectedTagItem}
                items={tagItems}
                onSave={onSave}
                backToRoute={backToRoute}
            />
        </RuleSelectionBase>
    );
}

export default AddTagPage;
