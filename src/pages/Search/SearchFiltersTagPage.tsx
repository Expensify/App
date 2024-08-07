import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTagsNamesFromTagsList} from '@libs/PolicyUtils';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyTagLists} from '@src/types/onyx';

function SearchFiltersTagPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedTagsItems = searchAdvancedFiltersForm?.tag?.map((tag) => ({name: tag, value: tag}));
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [allPoliciesTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const singlePolicyTagsList = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];

    const tagItems = useMemo(() => {
        const items: SearchMultipleSelectionPickerItem[] = [];
        if (!singlePolicyTagsList) {
            const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
            const tagNamesWithRepetitions = tagListsUnpacked
                .map((singlePolicyTagList) => {
                    return getTagsNamesFromTagsList(singlePolicyTagList);
                })
                .flat();
            tagNamesWithRepetitions.forEach((name) => {
                if (items.some((item) => item.name === name)) {
                    return;
                }
                items.push({name, value: name});
            });
        } else {
            getTagsNamesFromTagsList(singlePolicyTagsList).forEach((name) => {
                items.push({name, value: name});
            });
        }

        return items;
    }, [allPoliciesTagsLists, singlePolicyTagsList]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({tag: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTagPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
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
                    onSaveSelection={onSaveSelection}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersTagPage.displayName = 'SearchFiltersTagPage';

export default SearchFiltersTagPage;
