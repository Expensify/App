import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName, getTagLists} from '@libs/PolicyUtils';
import {trimTag} from '@libs/TagUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type AddTagPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_TAG>;

function AddTagPage({route}: AddTagPageProps) {
    const {hash, index: orderWeight} = route.params ?? {};

    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [policyTags = getEmptyArray<ValueOf<PolicyTagLists>>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${activePolicyID}`, {selector: getTagLists});
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

    const backToRoute = hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute();

    const onSave = (value?: string) => {
        const newTags = [...formTags];
        if (hasDependentTags) {
            newTags.splice(orderWeight, newTags.length - orderWeight, value ?? '');
        } else {
            newTags[orderWeight] = value ?? '';
        }
        updateDraftRule({tag: trimTag(newTags.join(':'))});
    };

    return (
        <RuleSelectionBase
            titleKey="common.tag"
            title={tagList?.name}
            testID="AddTagPage"
            selectedItem={selectedTagItem}
            items={tagItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
            hash={hash}
        />
    );
}

export default AddTagPage;
