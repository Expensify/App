import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem, TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import {isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

const SEARCH_THRESHOLD = 12;

type EligiblePolicyItem = {
    id: string;
    title: string;
    avatarURL?: string;
};

function CopyPolicySettingsSelectWorkspacesPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.ROOT>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails?.email;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [selectedTargetIDs, setSelectedTargetIDs] = useState<string[] | null>(null);
    const resolvedSelectedTargetIDs = selectedTargetIDs ?? copyPolicySettings?.targetPolicyIDs ?? [];

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const isSourceCorporate = sourcePolicy?.type === CONST.POLICY.TYPE.CORPORATE;

    const eligiblePolicies: EligiblePolicyItem[] = !policies
        ? []
        : Object.values(policies)
              .filter((policy): policy is Policy => {
                  if (!policy || policy.id === sourcePolicyID || policy.type === CONST.POLICY.TYPE.PERSONAL || isPendingDeletePolicy(policy) || !isPolicyAdmin(policy, currentUserEmail)) {
                      return false;
                  }
                  // Release 1: when copying from a Corporate workspace, only allow Corporate targets.
                  // Issue 7 (R2) lifts this restriction by inserting an upgrade step.
                  if (isSourceCorporate && policy.type !== CONST.POLICY.TYPE.CORPORATE) {
                      return false;
                  }
                  return true;
              })
              .map((policy) => ({
                  id: policy.id,
                  title: policy.name,
                  avatarURL: policy.avatarURL,
              }))
              .sort((a, b) => localeCompare(a.title, b.title));

    const filterPolicy = (policy: EligiblePolicyItem, query: string) => policy.title.toLowerCase().includes(query.toLowerCase());
    const sortPolicies = (items: EligiblePolicyItem[]) => items;
    const [searchValue, setSearchValue, filteredPolicies] = useSearchResults(eligiblePolicies, filterPolicy, sortPolicies);

    const shouldShowSearch = eligiblePolicies.length > SEARCH_THRESHOLD;

    const listItems: ListItem[] = filteredPolicies.map((policy) => ({
        text: policy.title,
        keyForList: policy.id,
        isSelected: resolvedSelectedTargetIDs.includes(policy.id),
        leftElement: (
            <View style={[styles.mr3]}>
                <Avatar
                    source={policy.avatarURL ?? getDefaultWorkspaceAvatar(policy.title)}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    name={policy.title}
                    avatarID={policy.id}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
            </View>
        ),
    }));

    const toggleItem = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const id = item.keyForList;
        setSelectedTargetIDs((prev) => {
            const current = prev ?? resolvedSelectedTargetIDs;
            return current.includes(id) ? current.filter((selectedID) => selectedID !== id) : [...current, id];
        });
    };

    // Scope select-all to the currently visible (filtered) rows so its behavior matches
    // the header checkbox state that SelectionList derives from filteredPolicies. Selections
    // on rows hidden by the active search are preserved across toggles.
    const toggleAll = () => {
        const visibleIDs = filteredPolicies.map((policy) => policy.id);
        if (visibleIDs.length === 0) {
            return;
        }
        setSelectedTargetIDs((prev) => {
            const current = prev ?? resolvedSelectedTargetIDs;
            const areAllVisibleSelected = visibleIDs.every((id) => current.includes(id));
            if (areAllVisibleSelected) {
                const visibleSet = new Set(visibleIDs);
                return current.filter((id) => !visibleSet.has(id));
            }
            return Array.from(new Set([...current, ...visibleIDs]));
        });
    };

    const onConfirm = () => {
        if (!sourcePolicyID) {
            return;
        }

        const previousTargetIDs = copyPolicySettings?.targetPolicyIDs ?? [];
        const shouldClearParts = previousTargetIDs.length !== resolvedSelectedTargetIDs.length || !previousTargetIDs.every((id) => resolvedSelectedTargetIDs.includes(id));

        setCopyPolicySettingsData({
            sourcePolicyID,
            targetPolicyIDs: resolvedSelectedTargetIDs,
            ...(shouldClearParts ? {parts: []} : {}),
        });

        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID));
    };

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.next'),
        onConfirm,
        isDisabled: resolvedSelectedTargetIDs.length === 0,
    };

    const textInputOptions: TextInputOptions = {
        label: translate('workspace.copyPolicySettings.selectWorkspaces.searchPlaceholder'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: filteredPolicies.length === 0 && searchValue.length > 0 ? translate('common.noResultsFound') : undefined,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={sourcePolicyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={CopyPolicySettingsSelectWorkspacesPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.copyPolicySettings.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectWorkspaces.title')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.selectWorkspaces.description')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <SelectionList
                        data={listItems}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={toggleItem}
                        onSelectAll={eligiblePolicies.length > 0 ? toggleAll : undefined}
                        selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.RIGHT}
                        shouldHeaderBeInsideList
                        shouldSingleExecuteRowSelect
                        addBottomSafeAreaPadding
                        confirmButtonOptions={confirmButtonOptions}
                        shouldShowTextInput={shouldShowSearch}
                        textInputOptions={shouldShowSearch ? textInputOptions : undefined}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsSelectWorkspacesPage.displayName = 'CopyPolicySettingsSelectWorkspacesPage';

export default CopyPolicySettingsSelectWorkspacesPage;
