import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceTimeTrackingHourlyRateSection from './WorkspaceTimeTrackingHourlyRateSection';

type WorkspaceTimeTrackingPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TIME_TRACKING>;

function WorkspaceTimeTrackingPage({route}: WorkspaceTimeTrackingPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Clock']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.TIME_TRACKING)}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={translate('workspace.moreFeatures.timeTracking.title')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={illustrations.Clock}
                addBottomSafeAreaPadding
            >
                {(_, policyID) =>
                    !!policyID && (
                        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <WorkspaceTimeTrackingHourlyRateSection policyID={policyID} />
                        </View>
                    )
                }
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTimeTrackingPage;
