import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import usePolicy from '@hooks/usePolicy';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ImportWorkflowsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_IMPORT>;

// Reuses the Members spreadsheet importer (it already maps the `submitsTo` / `approvesTo` columns) so approval
// workflows can be bulk-imported directly from the Workflows page. `backTo` returns the upload screen to Workflows,
// and `goTo` sends the mapping step to the Workflows-context imported screen (instead of the Members one).
function ImportWorkflowsPage({route}: ImportWorkflowsPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)}
                goTo={ROUTES.WORKSPACE_WORKFLOWS_IMPORTED.getRoute(policyID)}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default ImportWorkflowsPage;
