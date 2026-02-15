import React, {useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {WorkspaceListItemType} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import type {MoneyRequestNavigatorParamList} from '@navigation/types';
import {setNameValuePair} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SetDefaultWorkspacePageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.SET_DEFAULT_WORKSPACE>;

function SetDefaultWorkspacePage({route}: SetDefaultWorkspacePageProps) {
    const {navigateTo} = route.params ?? {};
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
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

        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyID}`];

        // eslint-disable-next-line rulesdir/no-default-id-values
        setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, selectedPolicyID, activePolicyID ?? '');

        if (policy?.areCategoriesEnabled) {
            Navigation.navigate(navigateTo);
            return;
        }

        Navigation.goBack();
    };

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (newPolicy) => isPaidGroupPolicy(newPolicy),
    });

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
            testID="SetDefaultWorkspacePage"
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
                        <SelectionList<WorkspaceListItemType>
                            data={data}
                            ListItem={UserListItem}
                            textInputOptions={textInputOptions}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            disableMaintainingScrollPosition
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default SetDefaultWorkspacePage;
