import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {exitSavedViewEditMode, saveSavedViewEdits, setSaveAsNewViewQuery} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {canSaveEditedView} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {EditingSavedSearch} from '@src/types/onyx';
import AmountFilterContentPopupWrapper from './AmountFilterContentPopupWrapper';
import CommonFilterContentPopupWrapper from './CommonFilterContentPopupWrapper';
import DateFilterContentPopupWrapper from './DateFilterContentPopupWrapper';
import ReportFieldFilterContentPopupWrapper from './ReportFieldFilterContentPopupWrapper';
import TextInputFilterContentPopupWrapper from './TextInputFilterContentPopupWrapper';

type SearchAdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;

    /** Set when the popover is opened through the saved-view "Edit filters" flow; renders the edit footer */
    editingSavedView?: EditingSavedSearch;

    /** Closes the popover (provided by FilterPopupButton) */
    closeOverlay?: () => void;
};

function SearchAdvancedFiltersPopup({queryJSON, editingSavedView, closeOverlay}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const {updateFilterQueryParams, getUpdatedFilterFormValues, buildFilterQueryString, setFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    const isEditingSavedView = !!editingSavedView;

    // In edit mode the filters are a draft: changes don't touch the active search until Save, so clicking outside leaves
    // the saved view unchanged. The draft starts from the view's filters (the active search is the view while editing).
    const [draftValues, setDraftValues] = useState<Partial<SearchAdvancedFiltersForm>>(searchAdvancedFiltersForm ?? {});
    const displayValues = isEditingSavedView ? draftValues : searchAdvancedFiltersForm;
    const onFilterChange = isEditingSavedView ? (values: Partial<SearchAdvancedFiltersForm>) => setDraftValues((prev) => getUpdatedFilterFormValues(prev, values)) : updateFilterQueryParams;

    const draftQueryJSON = isEditingSavedView ? buildSearchQueryJSON(buildFilterQueryString(draftValues)) : undefined;
    // Only show the footer once the draft is saveable (changed from the view and not already another saved view).
    const shouldShowEditFooter = isEditingSavedView && canSaveEditedView(savedSearches, draftQueryJSON?.hash);

    // The draft never touches the active search, so leaving edit mode just clears the flag (nothing to revert).
    const onCancel = () => {
        exitSavedViewEditMode();
        closeOverlay?.();
    };

    const onSaveAsNewView = () => {
        const queryString = buildFilterQueryString(draftValues);
        if (!queryString) {
            return;
        }
        // Carry the draft to the save page without changing the active search (it stays on the view until saved).
        setSaveAsNewViewQuery(queryString);
        closeOverlay?.();
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const onSaveEdits = () => {
        if (editingSavedView && draftQueryJSON) {
            // Apply the draft to the active search and persist it onto the view.
            setFilterQueryParams(draftValues);
            saveSavedViewEdits({queryJSON: draftQueryJSON, editingSavedView});
        }
        closeOverlay?.();
    };

    const popoverHeight = Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT);

    // In edit mode the popover reserves space for the footer, so the master-detail shrinks to share the popover height.
    const masterDetailRowStyle = isEditingSavedView ? [styles.flex1, styles.mnh0] : StyleUtils.getHeight(popoverHeight);

    const masterDetail = (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, masterDetailRowStyle]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={displayValues?.type}
                    policyID={displayValues?.policyID}
                    selectedFilter={selectedFilter}
                    onHoverIn={setSelectedFilter}
                    onFocus={setSelectedFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <SearchAdvancedFiltersContent
                        values={displayValues}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        components={{
                            Common: CommonFilterContentPopupWrapper,
                            Text: TextInputFilterContentPopupWrapper,
                            Amount: AmountFilterContentPopupWrapper,
                            Date: DateFilterContentPopupWrapper,
                            ReportField: ReportFieldFilterContentPopupWrapper,
                        }}
                        onChange={onFilterChange}
                    />
                </View>
            </View>
        </SafeTriangle>
    );

    if (!isEditingSavedView) {
        return masterDetail;
    }

    return (
        <View style={[styles.flexColumn, StyleUtils.getHeight(popoverHeight)]}>
            <View style={[styles.flex1, styles.mnh0]}>{masterDetail}</View>
            {shouldShowEditFooter && (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap2, styles.ph3, styles.pv3, styles.borderTop]}>
                    <Button
                        text={translate('common.cancel')}
                        onPress={onCancel}
                        innerStyles={styles.bgTransparent}
                        textStyles={styles.textSupporting}
                        shouldUseDefaultHover={false}
                        hoverStyles={styles.hoveredComponentBG}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                    />
                    <View style={[styles.flexRow, styles.gap2]}>
                        <Button
                            text={translate('search.saveAsNewView')}
                            onPress={onSaveAsNewView}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_VIEW_BUTTON}
                        />
                        <Button
                            success
                            text={translate('search.saveEdits')}
                            onPress={onSaveEdits}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_VIEW_BUTTON}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export default SearchAdvancedFiltersPopup;
