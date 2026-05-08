import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PressableWithFeedback} from '@components/Pressable';
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
import {isPolicyAdmin} from '@libs/PolicyUtils';
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

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const isSourceCorporate = sourcePolicy?.type === CONST.POLICY.TYPE.CORPORATE;

    const eligiblePolicies = useMemo<EligiblePolicyItem[]>(() => {
        if (!policies) {
            return [];
        }
        return Object.values(policies)
            .filter((policy): policy is Policy => {
                if (!policy || policy.id === sourcePolicyID) {
                    return false;
                }
                if (policy.type === CONST.POLICY.TYPE.PERSONAL) {
                    return false;
                }
                if (!isPolicyAdmin(policy, currentUserEmail)) {
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
    }, [policies, sourcePolicyID, isSourceCorporate, currentUserEmail, localeCompare]);

    const filterPolicy = useCallback((policy: EligiblePolicyItem, query: string) => policy.title.toLowerCase().includes(query.toLowerCase()), []);
    const sortPolicies = useCallback((items: EligiblePolicyItem[]) => items, []);
    const [searchValue, setSearchValue, filteredPolicies] = useSearchResults(eligiblePolicies, filterPolicy, sortPolicies);

    const shouldShowSearch = eligiblePolicies.length > SEARCH_THRESHOLD;
    const selectedTargetIDs = copyPolicySettings?.targetPolicyIDs ?? [];

    const listItems: ListItem[] = useMemo(
        () =>
            filteredPolicies.map((policy) => ({
                text: policy.title,
                keyForList: policy.id,
                isSelected: selectedTargetIDs.includes(policy.id),
            })),
        [filteredPolicies, selectedTargetIDs],
    );

    const toggleItem = useCallback(
        (item: ListItem) => {
            if (!item.keyForList) {
                return;
            }
            const next = item.isSelected ? selectedTargetIDs.filter((id) => id !== item.keyForList) : [...selectedTargetIDs, item.keyForList];
            setCopyPolicySettingsData({targetPolicyIDs: next});
        },
        [selectedTargetIDs],
    );

    const isSelectAllChecked = eligiblePolicies.length > 0 && selectedTargetIDs.length === eligiblePolicies.length;
    const isIndeterminate = selectedTargetIDs.length > 0 && !isSelectAllChecked;

    const toggleAll = useCallback(() => {
        if (isSelectAllChecked) {
            setCopyPolicySettingsData({targetPolicyIDs: []});
            return;
        }
        setCopyPolicySettingsData({targetPolicyIDs: eligiblePolicies.map((policy) => policy.id)});
    }, [isSelectAllChecked, eligiblePolicies]);

    const onConfirm = useCallback(() => {
        if (!sourcePolicyID) {
            return;
        }
        setCopyPolicySettingsData({sourcePolicyID, targetPolicyIDs: selectedTargetIDs});
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID));
    }, [sourcePolicyID, selectedTargetIDs]);

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = useMemo(
        () => ({
            showButton: true,
            text: translate('common.next'),
            onConfirm,
            isDisabled: selectedTargetIDs.length === 0,
        }),
        [translate, onConfirm, selectedTargetIDs.length],
    );

    const textInputOptions: TextInputOptions = useMemo(
        () => ({
            label: translate('workspace.copySettings.searchPlaceholder'),
            value: searchValue,
            onChangeText: setSearchValue,
            headerMessage: filteredPolicies.length === 0 && searchValue.length > 0 ? translate('common.noResultsFound') : undefined,
        }),
        [translate, searchValue, setSearchValue, filteredPolicies.length],
    );

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
                    title={translate('workspace.copySettings.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copySettings.selectWorkspaces')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copySettings.whichWorkspaces')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <View style={[styles.searchListHeaderContainerStyle, styles.pv3, styles.ph5, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={toggleAll}
                            accessible={false}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            tabIndex={-1}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COPY_SETTINGS_SELECT_WORKSPACES_SELECT_ALL}
                        >
                            <Text style={[styles.textLabelSupporting]}>{translate('workspace.copySettings.selectAll')}</Text>
                        </PressableWithFeedback>
                        <Checkbox
                            accessibilityLabel={translate('workspace.copySettings.selectAll')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            onPress={toggleAll}
                            disabled={eligiblePolicies.length === 0}
                            shouldSelectOnPressEnter
                        />
                    </View>
                    <SelectionList
                        data={listItems}
                        ListItem={MultiSelectListItem}
                        onSelectRow={toggleItem}
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
