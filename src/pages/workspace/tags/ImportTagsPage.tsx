import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportTagsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT>;

function ImportTagsPage({route}: ImportTagsPageProps) {
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;

    return (
        <ImportSpreedsheet
            backTo={backTo ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS.getRoute(policyID)}
            goTo={backTo ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportTagsPage;
