import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type CompanyCardsImportSpreadsheetPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_IMPORT_SPREADSHEET>;

function CompanyCardsImportSpreadsheetPage({route}: CompanyCardsImportSpreadsheetPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const isEditing = !!addNewCard?.data?.layoutType;
    const backTo = isEditing
        ? ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID)
        : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    const goTo = ROUTES.WORKSPACE_COMPANY_CARDS_IMPORTED.getRoute(policyID);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={backTo}
                goTo={goTo}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default CompanyCardsImportSpreadsheetPage;
