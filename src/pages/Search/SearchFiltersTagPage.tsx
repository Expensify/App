import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
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
    const selectedTags = searchAdvancedFiltersForm?.tag;
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [allPoliciesTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const singlePolicyTagsList = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];

    const tagNames = useMemo(() => {
        let names: string[] = [];
        if (!singlePolicyTagsList) {
            const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
            names = tagListsUnpacked
                .map((singlePolicyTagList) => {
                    return getTagsNamesFromTagsList(singlePolicyTagList);
                })
                .flat();
        } else {
            names = getTagsNamesFromTagsList(singlePolicyTagsList);
        }

        return [...new Set(names)];
    }, [allPoliciesTagsLists, singlePolicyTagsList]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({tag: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTagPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('common.tag')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <View style={[styles.flex1]}>
                    <SearchMultipleSelectionPicker
                        pickerTitle={translate('common.tag')}
                        items={tagNames}
                        initiallySelectedItems={selectedTags}
                        onSaveSelection={onSaveSelection}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersTagPage.displayName = 'SearchFiltersTagPage';

export default SearchFiltersTagPage;
