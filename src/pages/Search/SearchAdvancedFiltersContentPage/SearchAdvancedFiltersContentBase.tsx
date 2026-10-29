import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchAdvancedFiltersParamList} from '@libs/Navigation/types';
import {FILTER_VIEW_MAP, getFilterViewLabelKey, isAmountFilterKey, isDateFilterKey, isReportFieldKey, isTextFilterKey} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/core';
import React, {useContext} from 'react';
import {View} from 'react-native';

import AmountFilterContentPageWrapper from './AmountFilterContentPageWrapper';
import DateFilterContentPageWrapper from './DateFilterContentPageWrapper';
import ListFilterContentPageWrapper from './ListFilterContentPageWrapper';
import MerchantFilterContentPageWrapper from './MerchantFilterContentPageWrapper';
import ReportFieldFilterContentPageWrapper from './ReportFieldFilterContentPageWrapper';
import TextInputFilterContentPageWrapper from './TextInputFilterContentPageWrapper';

function isFilterKeyValid(filterKey: string): filterKey is SearchFilter['key'] {
    return filterKey in FILTER_VIEW_MAP;
}

const CONFIRM_BUTTON_HEIGHT = variables.componentSizeLarge;

function SearchAdvancedFiltersContentBase() {
    const route = useRoute<PlatformStackRouteProp<SearchAdvancedFiltersParamList, typeof SCREENS.SEARCH.ADVANCED_FILTERS_CONTENT_RHP>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const filterKey = route.params.filterKey;
    const shouldApplyFilterChangeDirectly = !!route.params.applyDirectly;
    const {currentDraftFilters} = useContext(SearchAdvancedFiltersContext);
    const {setDraftFilters} = useContext(SearchAdvancedFiltersActionContext);
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {updateFilterQueryParams} = useUpdateFilterQuery(currentSearchQueryJSON);
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const validFilterKey = isFilterKeyValid(filterKey) ? filterKey : undefined;
    // In direct-apply mode there is no draft to read from, the form holds the currently applied filters
    const currentValues = shouldApplyFilterChangeDirectly ? searchAdvancedFiltersForm : currentDraftFilters;

    const goBack = () => {
        if (shouldApplyFilterChangeDirectly) {
            Navigation.goBack();
        } else {
            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
        }
    };

    // Every key that isn't amount/date/text/report-field falls through to the selection list branch of SearchAdvancedFiltersContent
    const isFilterWithSelectionList =
        !!validFilterKey && !isAmountFilterKey(validFilterKey) && !isDateFilterKey(validFilterKey) && !isTextFilterKey(validFilterKey) && !isReportFieldKey(validFilterKey);

    const buttonText = shouldApplyFilterChangeDirectly ? translate('common.apply') : undefined;

    const getCollapsibleHeaderOffset = () => {
        if (!validFilterKey) {
            return undefined;
        }

        // We want to make space for the confirm button for filters with text inputs without list
        if (isAmountFilterKey(validFilterKey) || isTextFilterKey(validFilterKey) || isReportFieldKey(validFilterKey)) {
            return CONFIRM_BUTTON_HEIGHT;
        }

        return undefined;
    };

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) =>
                validFilterKey ? (
                    <>
                        <CollapsibleHeaderOnKeyboard
                            collapsibleHeaderOffset={getCollapsibleHeaderOffset()}
                            // In landscape mode we want to show as much of the selection list as possible for filters that use it
                            alwaysCollapseHeaderOnKeyboard={isFilterWithSelectionList}
                        >
                            <HeaderWithBackButton
                                title={translate(getFilterViewLabelKey(validFilterKey, currentValues?.type))}
                                onBackButtonPress={goBack}
                            />
                        </CollapsibleHeaderOnKeyboard>

                        <View style={[styles.filterContentContainer]}>
                            <SearchAdvancedFiltersContent
                                values={currentValues}
                                baseFilterKey={validFilterKey}
                                ready={didScreenTransitionEnd}
                                components={{
                                    List: ListFilterContentPageWrapper,
                                    Merchant: MerchantFilterContentPageWrapper,
                                    Text: TextInputFilterContentPageWrapper,
                                    Amount: AmountFilterContentPageWrapper,
                                    Date: DateFilterContentPageWrapper,
                                    ReportField: ReportFieldFilterContentPageWrapper,
                                }}
                                buttonText={buttonText}
                                onChange={(newValues) => {
                                    const updatedValues = {...newValues};
                                    const selectedReceiptTypes = newValues.receiptType;
                                    // A positive receipt-type selection drops those values from the negated filter so the query can't emit both receiptType and -receiptType for the same value
                                    if (selectedReceiptTypes !== undefined) {
                                        const remainingNegatedReceiptTypes = currentValues?.receiptTypeNot?.filter((receiptType) => !selectedReceiptTypes.includes(receiptType));
                                        updatedValues.receiptTypeNot = remainingNegatedReceiptTypes?.length ? remainingNegatedReceiptTypes : undefined;
                                    }

                                    if (shouldApplyFilterChangeDirectly) {
                                        Navigation.dismissModal({
                                            afterTransition: () => {
                                                updateFilterQueryParams(updatedValues);
                                            },
                                        });
                                        return;
                                    }

                                    setDraftFilters(updatedValues);
                                    goBack();
                                }}
                            />
                        </View>
                    </>
                ) : (
                    <FullPageNotFoundView shouldShow />
                )
            }
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersContentBase;
