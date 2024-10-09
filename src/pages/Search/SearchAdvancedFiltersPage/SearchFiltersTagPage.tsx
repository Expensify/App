import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyTagLists} from '@src/types/onyx';

function SearchFiltersTagPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedTagsItems = searchAdvancedFiltersForm?.tag?.map((tag) => ({name: tag, value: tag}));
    const policyID = searchAdvancedFiltersForm?.policyID;
    const [allPoliciesTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const singlePolicyTagsList: PolicyTagLists | undefined = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];

    const tagItems = useMemo(() => {
        if (!singlePolicyTagsList) {
            const uniqueTagNames = new Set<string>();
            const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
            tagListsUnpacked
                .map((policyTagLists) => {
                    return getTagNamesFromTagsLists(policyTagLists);
                })
                .flat()
                .forEach((tag) => uniqueTagNames.add(tag));
            return Array.from(uniqueTagNames).map((tagName) => ({name: tagName, value: tagName}));
        }
        return getTagNamesFromTagsLists(singlePolicyTagsList).map((name) => ({name, value: name}));
    }, [allPoliciesTagsLists, singlePolicyTagsList]);

    const updateTagFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({tag: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTagPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
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
                    pickerTitle={translate('common.tag')}
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
