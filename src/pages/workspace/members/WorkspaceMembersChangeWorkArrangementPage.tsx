import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import WorkArrangementSelector from '@components/WorkArrangementSelector';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite} from '@libs/PolicyUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

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

import React, {useState} from 'react';
import {View} from 'react-native';

type WorkspaceMembersChangeWorkArrangementPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_CHANGE_WORK_ARRANGEMENT> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMembersChangeWorkArrangementPage({policy, personalDetails, route}: WorkspaceMembersChangeWorkArrangementPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [selection, selectionMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT);
    const [chosenIsOffice, setChosenIsOffice] = useState<boolean>();

    // Members picked on another workspace's member list are left out, even when they also belong to this one
    const selectedAccountIDs = selection?.policyID === policyID ? selection.accountIDs : undefined;

    // The selection only lives in memory, so it is gone when the page is opened from a link or after a refresh
    const hasSelectedMembers = isLoadingOnyxValue(selectionMetadata) || !!selectedAccountIDs?.length;
    const canChangeWorkArrangement =
        isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS) &&
        canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS) &&
        policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE;

    const selectedMembers = (selectedAccountIDs ?? []).map((accountID) => ({
        accountID,
        isOffice: getEffectiveWorkArrangement(
            policy?.employeeList?.[personalDetails?.[accountID]?.login ?? '']?.hasOfficeWorkArrangement,
            policy?.commuterExclusions?.isOfficeWorkArrangement,
        ),
    }));

    // The arrangement the selected members share starts out selected, and none does while their arrangements differ
    const selectedMembersIsOffice = new Set(selectedMembers.map((member) => member.isOffice));
    const isOffice = chosenIsOffice ?? (selectedMembersIsOffice.size === 1 ? [...selectedMembersIsOffice].at(0) : undefined);

    const navigateBackToMembers = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    const changeWorkArrangement = () => {
        if (isOffice === undefined || !selectedAccountIDs?.length) {
            return;
        }

        // Members already on the chosen arrangement are left out, so a member following the workspace default keeps following it
        const accountIDsToUpdate = selectedMembers.filter((member) => member.isOffice !== isOffice).map((member) => member.accountID);
        if (accountIDsToUpdate.length) {
            setEmployeeWorkArrangement(policy, accountIDsToUpdate, isOffice, personalDetails);
        }
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeWorkArrangement || !hasSelectedMembers}
        >
            <ScreenWrapper
                testID="WorkspaceMembersChangeWorkArrangementPage"
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.workArrangementPage.title')}
                    onBackButtonPress={navigateBackToMembers}
                />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <WorkArrangementSelector
                        isOffice={isOffice}
                        onSelect={setChosenIsOffice}
                    />
                </ScrollView>
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting]}>{translate('workspace.people.workArrangementPage.futureOnlyNote')}</Text>
                </View>
                <FixedFooter>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={changeWorkArrangement}
                        isDisabled={isOffice === undefined}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('common.confirm')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersChangeWorkArrangementPage);
