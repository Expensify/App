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
import {clearSavedViewEditMode, saveSavedViewEdits} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {canSaveEditedView} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    /** Called before a Save-triggered close so the popover isn't reverted like a click-outside */
    preventRevertOnClose?: () => void;
};

function SearchAdvancedFiltersPopup({queryJSON, editingSavedView, closeOverlay, preventRevertOnClose}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    const isEditingSavedView = !!editingSavedView;

    // Editing a view applies filter changes to the active search live (the table updates behind the popover); the footer
    // only appears once the live query differs from the view (and isn't already another saved view).
    const shouldShowEditFooter = isEditingSavedView && canSaveEditedView(savedSearches, queryJSON.hash);

    // Cancel just closes; onOverlayClose re-executes the view's original query to restore it (same as clicking outside).
    const onCancel = () => {
        closeOverlay?.();
    };

    const onSaveAsNewView = () => {
        preventRevertOnClose?.();
        clearSavedViewEditMode();
        closeOverlay?.();
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const onSaveEdits = () => {
        preventRevertOnClose?.();
        if (editingSavedView) {
            saveSavedViewEdits({queryJSON, editingSavedView});
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
                    type={searchAdvancedFiltersForm?.type}
                    policyID={searchAdvancedFiltersForm?.policyID}
                    selectedFilter={selectedFilter}
                    onHoverIn={setSelectedFilter}
                    onFocus={setSelectedFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <SearchAdvancedFiltersContent
                        values={searchAdvancedFiltersForm}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        components={{
                            Common: CommonFilterContentPopupWrapper,
                            Text: TextInputFilterContentPopupWrapper,
                            Amount: AmountFilterContentPopupWrapper,
                            Date: DateFilterContentPopupWrapper,
                            ReportField: ReportFieldFilterContentPopupWrapper,
                        }}
                        onChange={updateFilterQueryParams}
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
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.EDIT_FILTERS_CANCEL_BUTTON}
                    />
                    <View style={[styles.flexRow, styles.gap2]}>
                        <Button
                            text={translate('search.saveAsNewView')}
                            onPress={onSaveAsNewView}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_AS_NEW_VIEW_BUTTON}
                        />
                        <Button
                            success
                            text={translate('search.saveEdits')}
                            onPress={onSaveEdits}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_EDITS_BUTTON}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export default SearchAdvancedFiltersPopup;
