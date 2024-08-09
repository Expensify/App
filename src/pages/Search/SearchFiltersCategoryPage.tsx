import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import type {CategorySection} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [noResultsFound, setNoResultsFound] = useState(false);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const currentCategories = searchAdvancedFiltersForm?.category;
    const [newCategories, setNewCategories] = useState<string[]>(currentCategories ?? []);
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';

    const [allPolicyIDCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const singlePolicyCategories = allPolicyIDCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];

    const categoryNames = useMemo(() => {
        let categories: string[] = [];
        if (!singlePolicyCategories) {
            categories = Object.values(allPolicyIDCategories ?? {})
                .map((policyCategories) => Object.values(policyCategories ?? {}).map((category) => category.name))
                .flat();
        } else {
            categories = Object.values(singlePolicyCategories ?? {}).map((value) => value.name);
        }

        return [...new Set(categories)];
    }, [allPolicyIDCategories, singlePolicyCategories]);

    const sections = useMemo(() => {
        const newSections: CategorySection[] = [];
        const chosenCategories = newCategories
            .filter((category) => category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: newCategories?.includes(name) ?? false,
            }));
        const remainingCategories = categoryNames
            .filter((category) => newCategories.includes(category) === false)
            .filter((category) => category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: newCategories?.includes(name) ?? false,
            }));
        if (chosenCategories.length === 0 && remainingCategories.length === 0) {
            setNoResultsFound(true);
        } else {
            setNoResultsFound(false);
        }
        newSections.push({
            title: undefined,
            data: chosenCategories,
            shouldShow: chosenCategories.length > 0,
        });
        newSections.push({
            title: translate('common.category'),
            data: remainingCategories,
            shouldShow: remainingCategories.length > 0,
        });
        return newSections;
    }, [categoryNames, newCategories, translate, debouncedSearchTerm]);

    const updateCategory = useCallback((values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
    }, []);

    const handleConfirmSelection = useCallback(() => {
        updateCategory({
            category: newCategories.sort((a, b) => localeCompare(a, b)),
        });
        Navigation.goBack();
    }, [newCategories, updateCategory]);

    const updateNewCategories = useCallback(
        (item: Partial<OptionData>) => {
            if (!item.text) {
                return;
            }
            if (item.isSelected) {
                setNewCategories(newCategories?.filter((category) => category !== item.text));
            } else {
                setNewCategories([...(newCategories ?? []), item.text]);
            }
        },
        [newCategories],
    );

    const footerContent = useMemo(
        () => (
            <Button
                success
                text={translate('common.save')}
                pressOnEnter
                onPress={handleConfirmSelection}
                large
            />
        ),
        [translate, handleConfirmSelection],
    );
    return (
        <ScreenWrapper
            testID={SearchFiltersCategoryPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('common.category')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <View style={[styles.flex1, styles.pb5]}>
                    <SelectionList
                        sections={sections}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        textInputLabel={translate('common.search')}
                        onSelectRow={updateNewCategories}
                        headerMessage={noResultsFound ? translate('common.noResultsFound') : undefined}
                        footerContent={footerContent}
                        shouldStopPropagation
                        showLoadingPlaceholder={!noResultsFound}
                        shouldShowTooltips
                        canSelectMultiple
                        ListItem={SelectableListItem}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersCategoryPage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersCategoryPage;
