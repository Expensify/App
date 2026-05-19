import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateZenefitsFinalApprover} from '@libs/actions/connections/Zenefits';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isZenefitsConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ZenefitsFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_ZENEFITS_FINAL_APPROVER>;

function ZenefitsFinalApproverPage({
    route: {
        params: {policyID},
    },
}: ZenefitsFinalApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const finalApprover = policy?.connections?.zenefits?.config?.finalApprover ?? null;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.ZENEFITS) || (!!policy && !isZenefitsConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="ZenefitsFinalApproverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.zenefits.finalApprover')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={finalApprover ?? ''}
                    setApprover={(email) => {
                        updateZenefitsFinalApprover(policyID, email, finalApprover, connectionSyncProgress);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID)));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ZenefitsFinalApproverPage;
