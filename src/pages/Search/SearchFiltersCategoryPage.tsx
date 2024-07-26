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

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const activeItems = searchAdvancedFiltersForm?.category;
    const policyId = searchAdvancedFiltersForm?.policyId ?? '-1';

    const [callCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [singlePolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyId}`);

    let categories: string[] = [];
    if (!singlePolicyCategories) {
        categories = Object.values(callCategories ?? {})
            .map((value) => Object.values(value ?? {}))
            .map((value2) => value2.map((value3) => value3?.name))
            .flat();
    } else {
        categories = Object.values(singlePolicyCategories ?? {}).map((value) => value.name);
    }

    const removeDuplicates = (array: string[]) => array.filter((value, index) => array.indexOf(value) === index);

    const categoryNames = removeDuplicates(categories);

    const categoryList = useMemo(
        () =>
            categoryNames
                .sort((a, b) => localeCompare(a, b))
                .map((name) => ({
                    text: name,
                    keyForList: name,
                    isSelected: activeItems?.includes(name) ?? false,
                    value: name,
                })),
        [categoryNames, activeItems],
    );

    const updateCategory = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.category')} />
                <View style={[styles.flex1]}>
                    <SelectionList
                        sections={[{data: categoryList}]}
                        onSelectRow={(item) => {
                            const isActive = activeItems?.includes(item.value);

                            let newCategories;

                            if (isActive) {
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

SearchFiltersStatusPage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersStatusPage;
