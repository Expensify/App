import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchAdvancedFiltersParamList} from '@libs/Navigation/types';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/core';
import React, {useContext} from 'react';
import {View} from 'react-native';

import AmountFilterContentPageWrapper from './AmountFilterContentPageWrapper';
import CommonFilterContentPageWrapper from './CommonFilterContentPageWrapper';
import DateFilterContentPageWrapper from './DateFilterContentPageWrapper';
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
    const isInLandscapeMode = useIsInLandscapeMode();

    const {currentSearchQueryJSON} = useSearchQueryContext();
    const filterKey = route.params.filterKey;
    const shouldApplyFilterChangeDirectly = !!route.params.applyDirectly;
    const {currentDraftFilters} = useContext(SearchAdvancedFiltersContext);
    const {setDraftFilters} = useContext(SearchAdvancedFiltersActionContext);
    const {updateFilterQueryParams} = useUpdateFilterQuery(currentSearchQueryJSON);
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const validFilterKey = isFilterKeyValid(filterKey) ? filterKey : undefined;

    const goBack = () => {
        if (shouldApplyFilterChangeDirectly) {
            Navigation.goBack();
        } else {
            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
        }
    };

    const isFilterWithSelectionList =
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO ||
        validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG;

    const shouldDisableKeyboardAvoidingView = isInLandscapeMode && isFilterWithSelectionList;

    const buttonText = shouldApplyFilterChangeDirectly ? translate('common.apply') : undefined;

    const getCollapsibleHeaderOffset = () => {
        if (!validFilterKey) {
            return undefined;
        }

        // We want to make space for the confirm button for filters with text inputs without list
        if (
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID ||
            validFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL
        ) {
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
            // In landscape mode we don't want to push confirm button above the keyboard for filters with selection list
            shouldEnableKeyboardAvoidingView={!shouldDisableKeyboardAvoidingView}
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
                                title={translate(FILTER_VIEW_MAP[validFilterKey].labelKey)}
                                onBackButtonPress={goBack}
                            />
                        </CollapsibleHeaderOnKeyboard>

                        <View style={[styles.filterContentContainer]}>
                            <SearchAdvancedFiltersContent
                                values={shouldApplyFilterChangeDirectly ? searchAdvancedFiltersForm : currentDraftFilters}
                                filterKey={validFilterKey}
                                policyIDQuery={currentSearchQueryJSON?.policyID}
                                ready={didScreenTransitionEnd}
                                components={{
                                    Common: CommonFilterContentPageWrapper,
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
                                        const remainingNegatedReceiptTypes = currentDraftFilters?.receiptTypeNot?.filter((receiptType) => !selectedReceiptTypes.includes(receiptType));
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
