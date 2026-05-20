import React, {Activity, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAdvancedFiltersToReset} from '@libs/actions/Search';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import FilterList from './FilterList';
import SelectedFilterContent from './SelectedFilterContent';

type AdvancedFiltersFullscreenProps = {
    queryJSON: SearchQueryJSON;
    closeOverlay: PopoverComponentProps['closeOverlay'];
};

function AdvancedFiltersFullscreen({queryJSON, closeOverlay}: AdvancedFiltersFullscreenProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key'] | null>(null);
    const [values, setValues] = useState<Partial<SearchAdvancedFiltersForm>>(searchAdvancedFiltersForm ?? {});

    const updateFilterQueryParams = useUpdateFilterQuery(queryJSON, true);

    const advancedFiltersToReset = searchAdvancedFiltersForm ? getAdvancedFiltersToReset(searchAdvancedFiltersForm) : undefined;

    return (
        <ScreenWrapperContainer
            testID="AdvancedFiltersFullscreen"
            shouldEnableMaxHeight={!!selectedFilter}
            includeSafeAreaPaddingBottom
            // Avoiding keyboard is already handled by the modal
            shouldEnableKeyboardAvoidingView={false}
            includePaddingTop={false}
            style={[styles.flex1]}
        >
            <HeaderWithBackButton
                title={translate(selectedFilter ? FILTER_VIEW_MAP[selectedFilter].labelKey : 'search.filtersHeader')}
                onBackButtonPress={() => {
                    if (selectedFilter) {
                        setSelectedFilter(null);
                        return;
                    }
                    closeOverlay();
                }}
            />
            <Activity mode={selectedFilter ? 'hidden' : 'visible'}>
                <FilterList
                    selectedFilter={selectedFilter}
                    onFilterSelected={setSelectedFilter}
                />
            </Activity>
            {!!selectedFilter && (
                <View style={[styles.filterContentContainer]}>
                    <SelectedFilterContent
                        values={values}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        onChange={(newValues) => {
                            setValues((prevValues) => ({...prevValues, ...newValues}));
                            setSelectedFilter(null);
                        }}
                    />
                </View>
            )}
            {!selectedFilter && (
                <>
                    {!isEmptyObject(advancedFiltersToReset) && (
                        <Button
                            style={[styles.ph5, styles.pb3]}
                            large
                            text={translate('common.reset')}
                            onPress={() => updateFilterQueryParams(advancedFiltersToReset)}
                        />
                    )}
                    <Button
                        style={[styles.ph5, styles.pb5]}
                        success
                        large
                        text={translate('search.applyFilters')}
                        onPress={() => updateFilterQueryParams(values)}
                    />
                </>
            )}
        </ScreenWrapperContainer>
    );
}

export default AdvancedFiltersFullscreen;
