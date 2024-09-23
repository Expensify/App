import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportCategoriesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORT>;

function ImportCategoriesPage({route}: ImportCategoriesPageProps) {
    const policyID = route.params.policyID;

    return (
        <ImportSpreedsheet
            backTo={ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)}
            goTo={ROUTES.WORKSPACE_CATEGORIES_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportCategoriesPage;
