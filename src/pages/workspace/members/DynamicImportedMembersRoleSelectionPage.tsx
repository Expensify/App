import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {setImportedSpreadsheetMemberRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicImportedMembersRoleSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_IMPORTED_MEMBERS_ROLE>;

function DynamicImportedMembersRoleSelectionPage({route}: DynamicImportedMembersRoleSelectionPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const [role = CONST.POLICY.ROLE.USER] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_ROLE);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.IMPORTED_MEMBERS_ROLE.path);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
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
