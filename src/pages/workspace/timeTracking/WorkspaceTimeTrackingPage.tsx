import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTimeTrackingPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;

function WorkspaceTimeTrackingHourlyRateSection({policyID}: {policyID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const horizontalPadding = shouldUseNarrowLayout ? styles.ph5 : styles.ph8;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <Section
            title={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
            subtitle={translate('workspace.moreFeatures.timeTracking.subtitle')}
            containerStyles={[styles.ph0, shouldUseNarrowLayout ? styles.pt5 : styles.pt8]}
            subtitleStyles={horizontalPadding}
            titleStyles={[styles.accountSettingsSectionTitle, horizontalPadding]}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                shouldShowLoadingSpinnerIcon={!policy}
                key={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                shouldShowRightIcon
                title={policy ? convertAmountToDisplayString(getDefaultTimeTrackingRate(policy), policy?.outputCurrency) : ''}
                description={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING_RATE.getRoute(policyID))}
                style={horizontalPadding}
            />
        </Section>
    );
}

function WorkspaceTimeTrackingPage({route}: WorkspaceTimeTrackingPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Clock']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED}
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
