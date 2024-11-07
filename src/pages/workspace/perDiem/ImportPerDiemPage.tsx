import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportPerDiemPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_IMPORT>;

function ImportPerDiemPage({route}: ImportPerDiemPageProps) {
    const policyID = route.params.policyID;

    return (
        <ImportSpreadsheet
            backTo={ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID)}
            goTo={ROUTES.WORKSPACE_PER_DIEM_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportPerDiemPage;
