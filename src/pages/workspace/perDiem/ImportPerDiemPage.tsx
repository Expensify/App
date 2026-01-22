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

type ImportPerDiemPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_IMPORT>;

function ImportPerDiemPage({route}: ImportPerDiemPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID)}
                goTo={ROUTES.WORKSPACE_PER_DIEM_IMPORTED.getRoute(policyID)}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default ImportPerDiemPage;
