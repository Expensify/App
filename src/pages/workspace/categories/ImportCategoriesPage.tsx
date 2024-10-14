import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import ImportSpreedsheet from '@components/ImportSpreadsheet';
import usePolicy from '@hooks/usePolicy';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportCategoriesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORT>;

function ImportCategoriesPage({route}: ImportCategoriesPageProps) {
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const policy = usePolicy(policyID);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    const isQuickSettingsFlow = !isEmpty(backTo);

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    return (
        <ImportSpreedsheet
            backTo={isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)}
            goTo={isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_IMPORTED.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES_IMPORTED.getRoute(policyID)}
        />
    );
}

export default ImportCategoriesPage;
