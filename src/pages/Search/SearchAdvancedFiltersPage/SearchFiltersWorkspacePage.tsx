import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const updateWorkspaceFilter = (policyID: string | null) => {
    updateAdvancedFilters({
        policyID,
    });
    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
};

function SearchFiltersWorkspacePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [policies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;

    const {sections, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyID: searchAdvancedFiltersForm?.policyID,
        searchTerm: debouncedSearchTerm,
    });

    return (
        <ScreenWrapper
            testID={SearchFiltersWorkspacePage.displayName}
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
                            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                        }}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <SelectionList<WorkspaceListItem>
                            ListItem={UserListItem}
                            sections={sections}
                            onSelectRow={(option) => {
                                if (option.policyID === searchAdvancedFiltersForm?.policyID || !option.policyID) {
                                    updateWorkspaceFilter(null);
                                    return;
                                }
                                updateWorkspaceFilter(option.policyID);
                            }}
                            textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''}
                            initiallyFocusedOptionKey={searchAdvancedFiltersForm?.policyID}
                            showLoadingPlaceholder={isLoadingOnyxValue(policiesResult) || !didScreenTransitionEnd}
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

SearchFiltersWorkspacePage.displayName = 'SearchFiltersWorkspacePage';

export default SearchFiltersWorkspacePage;
