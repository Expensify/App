import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportTagsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT>;

function ImportTagsPage({route}: ImportTagsPageProps) {
    const policyID = route.params.policyID;

    return (
        <ImportSpreedsheet
            backTo={ROUTES.WORKSPACE_TAGS.getRoute(policyID)}
            goTo={ROUTES.WORKSPACE_TAGS_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportTagsPage;
