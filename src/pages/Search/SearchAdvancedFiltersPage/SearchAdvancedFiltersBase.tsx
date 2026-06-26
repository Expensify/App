import React, {useContext, useEffect} from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SavedViewEditFooter from '@components/Search/SavedViewEditFooter';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {exitSavedViewEditMode} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';
import ROUTES from '@src/ROUTES';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters, isEditingSavedView, isSaveEditsDisabled, isSaveAsNewViewDisabled} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters, saveEdits, saveAsNewView, cancelEdits} = useContext(SearchAdvancedFiltersActionContext);

    // Clear edit mode if the fullscreen filters route is dismissed by any means (hardware/browser back, swipe), not
    // only the header back button or footer Cancel, so a stale SEARCH_EDITING_SAVED_VIEW can't keep a view highlighted.
    useEffect(
        () => () => {
            exitSavedViewEditMode();
        },
        [],
    );

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('search.filtersHeader')}
                onBackButtonPress={isEditingSavedView ? cancelEdits : undefined}
            />
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                policyID={currentDraftFilters.policyID}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            {isEditingSavedView ? (
                <SavedViewEditFooter
                    style={[styles.ph5, styles.pt3, styles.pb5]}
                    onCancel={cancelEdits}
                    onSaveEdits={saveEdits}
                    onSaveAsNewView={saveAsNewView}
                    isSaveEditsDisabled={isSaveEditsDisabled}
                    isSaveAsNewViewDisabled={isSaveAsNewViewDisabled}
                />
            ) : (
                <>
                    {shouldShowResetFilters && (
                        <Button
                            style={[styles.ph5, styles.pb3]}
                            large
                            text={translate('common.reset')}
                            onPress={resetFilters}
                        />
                    )}
                    <Button
                        style={[styles.ph5, styles.pb5]}
                        success
                        large
                        text={translate('search.applyFilters')}
                        onPress={applyFilters}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
