import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SavedViewEditFooter from '@components/Search/SavedViewEditFooter';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearSavedViewEditMode} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import ROUTES from '@src/ROUTES';

import React, {useContext, useEffect} from 'react';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters, isEditingSavedView, hasSaveableChange} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters, saveEdits, saveAsNewView, cancelEdits} = useContext(SearchAdvancedFiltersActionContext);

    // Only show the edit footer once there's a change you could save.
    const shouldShowEditFooter = isEditingSavedView && hasSaveableChange;

    // Clear edit mode if the route is dismissed by hardware/browser back or swipe (not just the header/Cancel).
    useEffect(
        () => () => {
            clearSavedViewEditMode();
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
            {shouldShowEditFooter && (
                <SavedViewEditFooter
                    style={[styles.ph5, styles.pt3, styles.pb5]}
                    onCancel={cancelEdits}
                    onSaveEdits={saveEdits}
                    onSaveAsNewView={saveAsNewView}
                />
            )}
            {!isEditingSavedView && (
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
