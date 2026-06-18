import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAdvancedFiltersToReset} from '@libs/SearchQueryUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import FilterList from './FilterList';
import SelectedFilterContent from './SelectedFilterContent';

// HeaderWithBackButton in ReportFieldBase uses styles.h10
const REPORT_FIELD_HEADER_HEIGHT = 40;

const CONFIRM_BUTTON_HEIGHT = 56;

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

    const getCollapsibleHeaderOffset = () => {
        if (!selectedFilter) {
            return undefined;
        }

        if (selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD) {
            return REPORT_FIELD_HEADER_HEIGHT + CONFIRM_BUTTON_HEIGHT;
        }

        if (
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT ||
            selectedFilter === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT
        ) {
            return CONFIRM_BUTTON_HEIGHT;
        }

        return undefined;
    };

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
            <CollapsibleHeaderOnKeyboard collapsibleHeaderOffset={getCollapsibleHeaderOffset()}>
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
            </CollapsibleHeaderOnKeyboard>
            <FilterList
                style={!!selectedFilter && styles.dNone}
                selectedFilter={selectedFilter}
                onFilterSelected={setSelectedFilter}
            />
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
