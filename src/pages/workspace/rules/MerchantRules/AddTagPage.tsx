import React, {useMemo} from 'react';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddTagPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAG>;

function AddTagPage({route}: AddTagPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});

    const selectedTagItem = form?.tag ? {name: getCleanedTagName(form.tag), value: form.tag} : undefined;

    const tagItems = useMemo(() => {
        const tags: Array<{name: string; value: string}> = [];

        for (const tagList of Object.values(policyTags ?? {})) {
            for (const tag of Object.values(tagList?.tags ?? {})) {
                if (!tag.enabled) {
                    continue;
                }
                tags.push({name: getCleanedTagName(tag.name), value: tag.name});
            }
        }

        return tags;
    }, [policyTags]);

    const backToRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({tag: value});
    };

    return (
        <RuleSelectionBase
            titleKey="common.tag"
            testID="AddTagPage"
            selectedItem={selectedTagItem}
            items={tagItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
        />
    );
}

AddTagPage.displayName = 'AddTagPage';

export default AddTagPage;
