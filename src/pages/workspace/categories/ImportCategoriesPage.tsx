import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import usePolicy from '@hooks/usePolicy';
import {appendDynamicRouteSuffixToBasePath} from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, hasAccountingConnections as hasAccountingConnectionsUtil} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ImportCategoriesPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_IMPORT | typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT
>;

function ImportCategoriesPage({route}: ImportCategoriesPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const hasAccountingConnections = hasAccountingConnectionsUtil(policy);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT;
    const backTo = isQuickSettingsFlow ? route.params.backTo : undefined;

    const workspaceCategoriesListBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_IMPORT.path);
    const workspaceGoToImportedPath = appendDynamicRouteSuffixToBasePath(workspaceCategoriesListBackPath, DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_IMPORTED.path);

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={isQuickSettingsFlow ? backTo : workspaceCategoriesListBackPath}
                goTo={isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_IMPORTED.getRoute(policyID, backTo) : workspaceGoToImportedPath}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default ImportCategoriesPage;
