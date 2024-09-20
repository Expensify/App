import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportMembersPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORT>;

function ImportMembersPage({route}: ImportMembersPageProps) {
    const policyID = route.params.policyID;

    return (
        <ImportSpreedsheet
            backTo={ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)}
            goTo={ROUTES.WORKSPACE_MEMBERS_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportMembersPage;
