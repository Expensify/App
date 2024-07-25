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
    const [allPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policyId = Object.values(allPolicy ?? {})[0]?.id;

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyId}`);

    const activeItems = searchAdvancedFiltersForm?.category;

    const categoryList = useMemo(
        () =>
            Object.values(policyCategories ?? {})
                .sort((a, b) => localeCompare(a.name, b.name))
                .map((value) => ({
                    text: value.name,
                    keyForList: value.name,
                    isSelected: activeItems?.includes(value.name) ?? false,
                    value: value.name,
                })),
        [activeItems, policyCategories],
    );

    const updateType = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
        // Navigation.goBack();
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

                            updateType({
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
