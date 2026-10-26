import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateEmployeeOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAssignableOfficeLocations, getMemberOfficeLocation, hasOfficeLocations} from '@libs/OfficeLocationUtils';
import {canMemberWrite} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceMembersChangeOfficeLocationPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_CHANGE_OFFICE_LOCATION> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMembersChangeOfficeLocationPage({policy, personalDetails, route}: WorkspaceMembersChangeOfficeLocationPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [selection, selectionMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT);
    const [chosenOfficeID, setChosenOfficeID] = useState<string>();

    // Members picked on another workspace's member list are left out, even when they also belong to this one
    const selectedAccountIDs = selection?.policyID === policyID ? selection.accountIDs : undefined;

    // The selection only lives in memory, so a page opened from a link or after a refresh has nothing to act on and returns to the members
    const isSelectionLoading = isLoadingOnyxValue(selectionMetadata);
    const selectedMemberCount = selectedAccountIDs?.length ?? 0;
    useEffect(() => {
        if (isSelectionLoading || selectedMemberCount > 0) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    }, [isSelectionLoading, selectedMemberCount, policyID]);

    const canChangeOfficeLocation =
        isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS) && canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS) && hasOfficeLocations(policy);
    const officeLocations = getAssignableOfficeLocations(policy, translate, localeCompare);

    const selectedMembers = (selectedAccountIDs ?? []).map((accountID) => ({
        accountID,
        officeID: getMemberOfficeLocation(officeLocations, policy?.employeeList?.[personalDetails?.[accountID]?.login ?? '']?.officeID)?.officeID,
    }));

    // The office the selected members share starts out selected, and none does while their offices differ
    const selectedMembersOfficeIDs = new Set(selectedMembers.map((member) => member.officeID));
    const officeID = chosenOfficeID ?? (selectedMembersOfficeIDs.size === 1 ? [...selectedMembersOfficeIDs].at(0) : undefined);

    const navigateBackToMembers = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    const changeOfficeLocation = () => {
        if (!officeID || !selectedAccountIDs?.length) {
            return;
        }

        // Members already in the chosen office are left out, so a member following the primary office keeps following it
        const accountIDsToUpdate = selectedMembers.filter((member) => member.officeID !== officeID).map((member) => member.accountID);
        if (accountIDsToUpdate.length) {
            updateEmployeeOfficeLocation(policy, accountIDsToUpdate, officeID, personalDetails);
        }
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    };

    const options: ListItem[] = officeLocations.map((officeLocation) => ({
        text: officeLocation.name,
        alternateText: officeLocation.address,
        keyForList: officeLocation.officeID,
        isSelected: officeLocation.officeID === officeID,
    }));

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeOfficeLocation}
        >
            <ScreenWrapper
                testID="WorkspaceMembersChangeOfficeLocationPage"
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.changeOfficeLocation')}
                    onBackButtonPress={navigateBackToMembers}
                />
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={({keyForList}) => setChosenOfficeID(keyForList)}
                        initiallyFocusedItemKey={officeID}
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.people.workArrangementPage.futureOnlyNote')}</Text>
                    </View>
                </View>
                <FixedFooter>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={changeOfficeLocation}
                        isDisabled={!officeID}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('common.confirm')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersChangeOfficeLocationPage);
