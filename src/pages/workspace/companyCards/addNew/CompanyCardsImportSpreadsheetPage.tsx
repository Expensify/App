import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CompanyCardsImportSpreadsheetPageProps = PlatformStackScreenProps<
    WorkspaceSplitNavigatorParamList,
    typeof SCREENS.WORKSPACE.COMPANY_CARDS_IMPORT_SPREADSHEET
>;

function CompanyCardsImportSpreadsheetPage({route}: CompanyCardsImportSpreadsheetPageProps) {
    const {policyID} = route.params;
    const backTo = ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID);
    const goTo = ROUTES.WORKSPACE_COMPANY_CARDS_IMPORTED.getRoute(policyID);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ImportSpreadsheet
                backTo={backTo}
                goTo={goTo}
            />
        </AccessOrNotFoundWrapper>
    );
}

CompanyCardsImportSpreadsheetPage.displayName = 'CompanyCardsImportSpreadsheetPage';

export default CompanyCardsImportSpreadsheetPage;

