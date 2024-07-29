import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const activeItems = searchAdvancedFiltersForm?.category;
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';

    const [allPolicyIdCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const singlePolicyCategories = allPolicyIdCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];

    const categoryList = useMemo(() => {
        let categories: string[] = [];
        if (!singlePolicyCategories) {
            categories = Object.values(allPolicyIdCategories ?? {})
                .map((policyCategories) => Object.values(policyCategories ?? {}).map((category) => category.name))
                .flat();
        } else {
            categories = Object.values(singlePolicyCategories ?? {}).map((value) => value.name);
        }

        const categoryNames = [...new Set(categories)];

        return categoryNames
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: activeItems?.includes(name) ?? false,
                value: name,
            }));
    }, [activeItems, allPolicyIdCategories, singlePolicyCategories]);

    const updateCategory = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersCategoryPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.category')} />
                <View style={[styles.flex1]}>
                    <SelectionList
                        sections={[{data: categoryList}]}
                        onSelectRow={(item) => {
                            let newCategories;

                            if (item.isSelected) {
                                newCategories = activeItems?.filter((category) => category !== item.value);
                            } else {
                                newCategories = [...(activeItems ?? []), item.value];
                            }

                            updateCategory({
                                category: newCategories,
                            });
                        }}
                        initiallyFocusedOptionKey={activeItems?.[0]}
                        shouldStopPropagation
                        ListItem={RadioListItem}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersCategoryPage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersCategoryPage;
