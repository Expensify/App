import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SetDefaultWorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {setNameValuePair} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SetDefaultWorkspacePageProps = PlatformStackScreenProps<SetDefaultWorkspaceNavigatorParamList, typeof SCREENS.SET_DEFAULT_WORKSPACE.ROOT>;

function SetDefaultWorkspacePage({route}: SetDefaultWorkspacePageProps) {
    const {navigateTo} = route.params ?? {};
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});

    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const session = useSession();

    const selectPolicy = (selectedPolicyID?: string) => {
        if (!selectedPolicyID) {
            return;
        }
        if (!navigateTo) {
            Log.hmmm(`[SetDefaultWorkspacePage] navigateTo is undefined. Cannot navigate after setting default workspace to ${selectedPolicyID}`);
            return;
        }
        const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${selectedPolicyID}`];

        // eslint-disable-next-line rulesdir/no-default-id-values
        setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, selectedPolicyID, activePolicyID ?? '');
        if (hasEnabledOptions(policyCategories ?? {})) {
            Navigation.navigate(navigateTo);
            return;
        }

        Navigation.goBack();
    };

    const {sections, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (newPolicy) => isPaidGroupPolicy(newPolicy),
    });

    return (
        <ScreenWrapper
            testID={SetDefaultWorkspacePage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('workspace.common.setAsDefault')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <SelectionList<WorkspaceListItem>
                            ListItem={UserListItem}
                            sections={sections}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''}
                            showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

SetDefaultWorkspacePage.displayName = 'SetDefaultWorkspacePage';

export default SetDefaultWorkspacePage;
