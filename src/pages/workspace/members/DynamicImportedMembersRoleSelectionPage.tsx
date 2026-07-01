import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {setImportedSpreadsheetMemberRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberAssignElevatedRole, canMemberAssignRole} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicImportedMembersRoleSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_IMPORTED_MEMBERS_ROLE>;

function DynamicImportedMembersRoleSelectionPage({route}: DynamicImportedMembersRoleSelectionPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [role = CONST.POLICY.ROLE.USER] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_ROLE);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.IMPORTED_MEMBERS_ROLE.path);
    const canAssignElevatedRoles = canMemberAssignElevatedRole(policy, currentUserLogin);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canAssignElevatedRoles}
        >
            <ScreenWrapper
                testID="DynamicImportedMembersRoleSelectionPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <WorkspaceMemberRoleList
                    role={role}
                    policy={policy}
                    onSelectRole={({value}) => {
                        if (!canMemberAssignRole(policy, currentUserLogin, value)) {
                            return;
                        }
                        setImportedSpreadsheetMemberRole(value);
                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.goBack(backPath);
                        });
                    }}
                    navigateBackTo={backPath}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicImportedMembersRoleSelectionPage;
