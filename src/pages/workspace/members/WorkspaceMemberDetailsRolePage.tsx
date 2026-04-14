import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';
import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type WorkspaceMemberDetailsRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE> & {
        /** Personal details of all users */
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberDetailsRolePage({policy, personalDetails, route}: WorkspaceMemberDetailsRolePageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];

    const changeRole = ({value}: ListItemType) => {
        if (value === member?.role) {
            return;
        }
        if (isSubmitPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)));
            return;
        }
        updateWorkspaceMembersRole(policy, [memberLogin], [accountID], value);
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="WorkspaceMemberDetailsRolePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <WorkspaceMemberRoleList
                    role={member?.role}
                    policy={policy}
                    onSelectRole={changeRole}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
