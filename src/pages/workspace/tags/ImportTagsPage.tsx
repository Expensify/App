import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportTagsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT>;

function ImportTagsPage({route}: ImportTagsPageProps) {
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const isQuickSettingsFlow = !isEmpty(backTo);

    return (
        <ImportSpreedsheet
            backTo={isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS.getRoute(policyID)}
            goTo={isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_IMPORTED.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportTagsPage;
