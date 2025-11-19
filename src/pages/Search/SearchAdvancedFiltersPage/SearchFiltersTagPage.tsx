import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function SearchFiltersTagPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const selectedTagsItems = searchAdvancedFiltersForm?.tag?.map((tag) => {
        if (tag === CONST.SEARCH.TAG_EMPTY_VALUE) {
            return {name: translate('search.noTag'), value: tag};
        }
        return {name: getCleanedTagName(tag), value: tag};
    });
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const selectedPoliciesTagLists = Object.keys(allPolicyTagLists ?? {})
        .filter((key) => policyIDs?.map((policyID) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`)?.includes(key))
        ?.map((key) => getTagNamesFromTagsLists(allPolicyTagLists?.[key] ?? {}))
        .flat();

    const tagItems = useMemo(() => {
        const items = [{name: translate('search.noTag'), value: CONST.SEARCH.TAG_EMPTY_VALUE as string}];
        const uniqueTagNames = new Set<string>();

        if (!selectedPoliciesTagLists || selectedPoliciesTagLists.length === 0) {
            const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
            for (const tag of tagListsUnpacked.map(getTagNamesFromTagsLists).flat()) {
                uniqueTagNames.add(tag);
            }
        } else {
            for (const tag of selectedPoliciesTagLists) {
                uniqueTagNames.add(tag);
            }
        }
        items.push(...Array.from(uniqueTagNames).map((tagName) => ({name: getCleanedTagName(tagName), value: tagName})));

        return items;
    }, [allPolicyTagLists, selectedPoliciesTagLists, translate]);

    const updateTagFilter = useCallback((values: string[]) => updateAdvancedFilters({tag: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTagPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.tag')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={tagItems}
                    initiallySelectedItems={selectedTagsItems}
                    onSaveSelection={updateTagFilter}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersTagPage.displayName = 'SearchFiltersTagPage';

export default SearchFiltersTagPage;
