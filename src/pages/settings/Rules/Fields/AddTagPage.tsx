import React, {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type AddTagPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_TAG>;

function AddTagPage({route}: AddTagPageProps) {
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {
        canBeMissing: true,
    });

    const selectedTagItem = form?.tag ? {name: getCleanedTagName(form.tag), value: form.tag} : undefined;

    const tagItems = useMemo(() => {
        const uniqueTagNames = new Set<string>();

        const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
        for (const tag of tagListsUnpacked.map(getTagNamesFromTagsLists).flat()) {
            uniqueTagNames.add(tag);
        }

        return Array.from(uniqueTagNames).map((tagName) => ({name: getCleanedTagName(tagName), value: tagName}));
    }, [allPolicyTagLists]);

    const hash = route.params?.hash;
    const backToRoute = hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute();

    const onSave = (value?: string) => {
        updateDraftRule({tag: value});
    };

    const ContentWrapper = useMemo(
        () =>
            ({children}: {children: React.ReactNode}) => <RuleNotFoundPageWrapper hash={hash}>{children}</RuleNotFoundPageWrapper>,
        [hash],
    );

    return (
        <RuleSelectionBase
            titleKey="common.tag"
            testID="AddTagPage"
            selectedItem={selectedTagItem}
            items={tagItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
            ContentWrapper={ContentWrapper}
        />
    );
}

export default AddTagPage;
