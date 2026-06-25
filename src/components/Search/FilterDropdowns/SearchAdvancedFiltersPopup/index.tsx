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
import {cancelSavedViewEdits, saveSavedViewEdits, setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getSavedViewSaveButtonDisabledStates} from '@libs/SearchUIUtils';
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

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    const isEditingSavedView = !!editingSavedView;

    // Saved views are keyed by their query hash; the helper computes which save buttons to disable (see its docs).
    const {isSaveAsNewViewDisabled, isSaveEditsDisabled} = getSavedViewSaveButtonDisabledStates(savedSearches, queryJSON.hash, editingSavedView?.hash);

    const onCancel = () => {
        if (editingSavedView) {
            cancelSavedViewEdits(editingSavedView);
        }
        closeOverlay?.();
    };

    const onSaveAsNewView = () => {
        closeOverlay?.();
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const onSaveEdits = () => {
        if (editingSavedView) {
            saveSavedViewEdits({queryJSON, name: editingSavedView.name, previousHash: editingSavedView.hash});
        }
        closeOverlay?.();
    };

    const popoverHeight = Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT);

    // In edit mode the popover also shows a footer, so the master-detail must shrink to share the fixed popover height
    // (otherwise its fixed height + the footer overflow the measured popover card and the footer spills out below it).
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
                        onChange={(values) => {
                            updateFilterQueryParams(values);
                            if (values.keyword) {
                                setSearchContext(true);
                            }
                        }}
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
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap2, styles.ph3, styles.pv3, styles.borderTop]}>
                <Button
                    text={translate('common.cancel')}
                    onPress={onCancel}
                    innerStyles={styles.bgTransparent}
                    textStyles={styles.textSupporting}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                />
                <View style={[styles.flexRow, styles.gap2]}>
                    <Button
                        text={translate('search.saveAsNewView')}
                        onPress={onSaveAsNewView}
                        isDisabled={isSaveAsNewViewDisabled}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_VIEW_BUTTON}
                    />
                    <Button
                        success
                        text={translate('search.saveEdits')}
                        onPress={onSaveEdits}
                        isDisabled={isSaveEditsDisabled}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_VIEW_BUTTON}
                    />
                </View>
            </View>
        </View>
    );
}

export default SearchAdvancedFiltersPopup;
