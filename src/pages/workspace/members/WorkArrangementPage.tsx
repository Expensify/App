import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import {setWorkspaceInviteWorkArrangementDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, isMemberInHomeAndOfficeWorkspace} from '@libs/PolicyUtils';
import {getEffectiveWorkArrangement, getMemberLoginByAccountID, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkArrangementOption = ListItem & {
    /** Whether selecting this option sets the member to office-based. */
    value: boolean;
    /** The localized label shown for this work arrangement. */
    text: string;
    /** The localized description shown beneath the label. */
    alternateText: string;
    /** Whether this option matches the member's current work arrangement. */
    isSelected: boolean;
};

type WorkArrangementPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    (
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT>
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT>
    ) & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkArrangementPage({policy, personalDetails, route}: WorkArrangementPageProps) {
    const isInviteFlow = route.name === SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT;
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isWorkArrangementBetaEnabled = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS);

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`);
    const [inviteWorkArrangementDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_WORK_ARRANGEMENT_DRAFT}${policyID}`);
    const [firstInviteLogin, firstInviteAccountID] = Object.entries(invitedEmailsToAccountIDsDraft ?? {}).at(0) ?? [];
    const accountID = isInviteFlow ? Number(firstInviteAccountID) : Number(route.params.accountID);
    const inviteLogin = isInviteFlow ? firstInviteLogin : undefined;
    const memberLogin = inviteLogin ?? personalDetails?.[accountID]?.login ?? getMemberLoginByAccountID(policy, accountID);
    const member = policy?.employeeList?.[memberLogin];
    const memberPersonalDetails = usePersonalDetailByLogin(memberLogin);
    const memberAccountID = memberPersonalDetails?.accountID ?? accountID;
    const canWriteMembers = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS);
    const isHomeAndOfficeWorkspace = policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE;
    const canAccessWorkArrangementPage =
        canWriteMembers && isWorkArrangementBetaEnabled && isHomeAndOfficeWorkspace && (isInviteFlow || isMemberInHomeAndOfficeWorkspace(policy, memberLogin));

    // The member-level setting wins; otherwise fall back to the workspace default, then to no regular workspace.
    const currentIsOffice = getEffectiveWorkArrangement(isInviteFlow ? inviteWorkArrangementDraft : member?.hasOfficeWorkArrangement, policy?.commuterExclusions?.isOfficeWorkArrangement);

    const navigateBackToDetails = () => {
        if (isInviteFlow) {
            Navigation.goBack(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(policyID));
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, memberAccountID));
    };

    const changeWorkArrangement = ({value}: WorkArrangementOption) => {
        if (value === currentIsOffice || !canAccessWorkArrangementPage) {
            return;
        }
        if (isInviteFlow) {
            setWorkspaceInviteWorkArrangementDraft(policyID, value);
            navigateBackToDetails();
            return;
        }
        setEmployeeWorkArrangement(policy, [memberAccountID], value, personalDetails, translate);
        navigateBackToDetails();
    };

    const options: WorkArrangementOption[] = [
        {
            value: true,
            text: getWorkArrangementLabel(translate, true),
            alternateText: translate('workspace.people.workArrangementPage.optionOfficeBasedHelp'),
            isSelected: currentIsOffice,
            keyForList: 'office-based',
        },
        {
            value: false,
            text: getWorkArrangementLabel(translate, false),
            alternateText: translate('workspace.people.workArrangementPage.optionNoRegularWorkspaceHelp'),
            isSelected: !currentIsOffice,
            keyForList: 'no-regular-workspace',
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canAccessWorkArrangementPage}
        >
            <ScreenWrapper
                testID="WorkArrangementPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={navigateBackToDetails} />
                    <Header.Title title={translate('workspace.people.workArrangementPage.title')} />
                </Header>
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={changeWorkArrangement}
                        shouldSingleExecuteRowSelect
                        shouldUpdateFocusedIndex
                        alternateNumberOfSupportedLines={2}
                        disableKeyboardShortcuts
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.people.workArrangementPage.futureOnlyNote')}</Text>
                    </View>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkArrangementPage);
