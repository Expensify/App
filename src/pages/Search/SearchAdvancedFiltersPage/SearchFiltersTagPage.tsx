import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyTagLists} from '@src/types/onyx';

function SearchFiltersTagPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedTagsItems = searchAdvancedFiltersForm?.tag?.map((tag) => {
        if (tag === CONST.SEARCH.EMPTY_VALUE) {
            return {name: translate('search.noTag'), value: tag};
        }
        return {name: getCleanedTagName(tag), value: tag};
    });
    const policyID = searchAdvancedFiltersForm?.policyID;
    const [allPolicyTagLists = {}] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const singlePolicyTagLists = allPolicyTagLists[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];

    const tagItems = useMemo(() => {
        const items = [{name: translate('search.noTag'), value: CONST.SEARCH.EMPTY_VALUE as string}];
        if (!singlePolicyTagLists) {
            const uniqueTagNames = new Set<string>();
            const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
            tagListsUnpacked
                .map(getTagNamesFromTagsLists)
                .flat()
                .forEach((tag) => uniqueTagNames.add(tag));
            items.push(...Array.from(uniqueTagNames).map((tagName) => ({name: getCleanedTagName(tagName), value: tagName})));
        } else {
            items.push(...getTagNamesFromTagsLists(singlePolicyTagLists).map((name) => ({name: getCleanedTagName(name), value: name})));
        }
        return items;
    }, [allPolicyTagLists, singlePolicyTagLists, translate]);

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
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
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
