import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canMemberWrite} from '@libs/PolicyUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import WorkspaceTimeTrackingDefaultRateSection from './WorkspaceTimeTrackingDefaultRateSection';

type WorkspaceTimeTrackingPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TIME_TRACKING>;

function WorkspaceTimeTrackingPage({route}: WorkspaceTimeTrackingPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.moreFeatures.timeTracking.title');
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Clock']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canWriteMoreFeatures = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={translate('workspace.moreFeatures.timeTracking.title')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={illustrations.Clock}
                addBottomSafeAreaPadding
                shouldEnableMaxHeight={false}
                policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <WorkspaceTimeTrackingDefaultRateSection
                        policyID={policyID}
                        canWriteMoreFeatures={canWriteMoreFeatures}
                    />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTimeTrackingPage;
