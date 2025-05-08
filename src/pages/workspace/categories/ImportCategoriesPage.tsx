import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import usePolicy from '@hooks/usePolicy';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ImportCategoriesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORT>;

function ImportCategoriesPage({route}: ImportCategoriesPageProps) {
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const policy = usePolicy(policyID);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    const isQuickSettingsFlow = !!backTo;

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils.goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={backTo}
                goTo={isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_IMPORTED.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES_IMPORTED.getRoute(policyID)}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default ImportCategoriesPage;
