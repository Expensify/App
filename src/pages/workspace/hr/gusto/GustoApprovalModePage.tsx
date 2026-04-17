import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type GustoApprovalModePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE>;

function GustoApprovalModePage({route}: GustoApprovalModePageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {policyID} = route.params;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GUSTO)}
        >
            <ScreenWrapper testID="GustoApprovalModePage">
                <HeaderWithBackButton
                    title={translate('workspace.hr.gusto.approvalMode')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default GustoApprovalModePage;
