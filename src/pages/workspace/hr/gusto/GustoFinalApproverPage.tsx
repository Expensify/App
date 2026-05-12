import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateGustoFinalApprover} from '@libs/actions/connections/Gusto';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isGustoConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type GustoFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_FINAL_APPROVER>;

function GustoFinalApproverPage({
    route: {
        params: {policyID},
    },
}: GustoFinalApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const finalApprover = policy?.connections?.gusto?.config?.finalApprover ?? null;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GUSTO) || (!!policy && !isGustoConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="GustoFinalApproverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.gusto.finalApprover')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={finalApprover ?? ''}
                    setApprover={(email) => {
                        updateGustoFinalApprover(policyID, email, finalApprover);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID)));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default GustoFinalApproverPage;
