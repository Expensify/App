import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import WorkspaceInvoiceBalanceSection from './WorkspaceInvoiceBalanceSection';
import WorkspaceInvoiceVBASection from './WorkspaceInvoiceVBASection';
import WorkspaceInvoicingDetailsSection from './WorkspaceInvoicingDetailsSection';

type WorkspaceInvoicesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;
function WorkspaceInvoicesPage({route}: WorkspaceInvoicesPageProps) {
    const policy = usePolicy(route.params.policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.invoices');
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['InvoiceBlue']);
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={translate('workspace.common.invoices')}
                shouldShowOfflineIndicatorInWideScreen
                shouldSkipVBBACall={!canWriteMoreFeatures}
                route={route}
                icon={illustrations.InvoiceBlue}
                addBottomSafeAreaPadding
                policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            >
                {(policyID?: string) => (
                    <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        {!!policyID && <WorkspaceInvoiceBalanceSection policyID={policyID} />}
                        {!!policyID && (
                            <WorkspaceInvoiceVBASection
                                policyID={policyID}
                                canWriteMoreFeatures={canWriteMoreFeatures}
                                showReadOnlyModal={showReadOnlyModal}
                            />
                        )}
                        {!!policyID && (
                            <WorkspaceInvoicingDetailsSection
                                policyID={policyID}
                                canWriteMoreFeatures={canWriteMoreFeatures}
                            />
                        )}
                    </View>
                )}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceInvoicesPage;
