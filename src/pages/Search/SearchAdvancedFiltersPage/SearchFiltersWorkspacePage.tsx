import {emailSelector} from '@selectors/Session';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const updateWorkspaceFilter = (policyID: string[] | null) => {
    updateAdvancedFilters({
        policyID,
    });
    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
};

function SearchFiltersWorkspacePage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [policies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const selectionListRef = useRef<SelectionListHandle<WorkspaceListItem>>(null);

    const [selectedOptions, setSelectedOptions] = useState<string[]>(() => (searchAdvancedFiltersForm?.policyID ? Array.from(searchAdvancedFiltersForm?.policyID) : []));

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: selectedOptions,
        searchTerm: debouncedSearchTerm,
        localeCompare,
    });

    const selectWorkspace = useCallback(
        (option: WorkspaceListItem) => {
            const optionIndex = selectedOptions.findIndex((selectedOption: string) => {
                const matchesPolicyId = selectedOption && selectedOption === option?.policyID;
                return matchesPolicyId;
            });

            if (optionIndex === -1 && option?.policyID) {
                setSelectedOptions([...selectedOptions, option.policyID]);

                requestAnimationFrame(() => {
                    selectionListRef.current?.scrollAndHighlightItem([option.keyForList]);
                });
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, optionIndex), ...selectedOptions.slice(optionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
        },
        [selectedOptions],
    );

    const applyChanges = useCallback(() => {
        const policyIds = selectedOptions.map((option) => (option ? option.toString() : undefined)).filter(Boolean) as string[];
        updateWorkspaceFilter(policyIds);
    }, [selectedOptions]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, []);

    const textInputOptions = useMemo(
        () => ({
            label: shouldShowSearchInput ? translate('common.search') : undefined,
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage: shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : '',
        }),
        [searchTerm, setSearchTerm, shouldShowNoResultsFoundMessage, shouldShowSearchInput, translate],
    );

    return (
        <ScreenWrapper
            testID="SearchFiltersWorkspacePage"
            includeSafeAreaPaddingBottom
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('workspace.common.workspace')}
                        onBackButtonPress={() => {
                            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                        }}
                        shouldDisplayHelpButton={false}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <SelectionList<WorkspaceListItem>
                            ref={selectionListRef}
                            data={data}
                            ListItem={UserListItem}
                            onSelectRow={selectWorkspace}
                            textInputOptions={textInputOptions}
                            canSelectMultiple
                            shouldUseDefaultRightHandSideCheckmark
                            showLoadingPlaceholder={isLoadingOnyxValue(policiesResult) || !didScreenTransitionEnd}
                            disableMaintainingScrollPosition
                            footerContent={
                                <SearchFilterPageFooterButtons
                                    applyChanges={applyChanges}
                                    resetChanges={resetChanges}
                                />
                            }
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default SearchFiltersWorkspacePage;
