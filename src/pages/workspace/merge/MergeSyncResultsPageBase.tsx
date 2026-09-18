/**
 * Shows the outcome of a finished sync for one connection category. For HR it lists employees added,
 * removed and skipped; for Recruiting it lists candidates.
 *
 * The sync payload is read from Onyx (the policy's connection sync progress), so only the workspace's
 * `policyID` needs to travel through the route.
 */
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getConnectedHRProvider} from '@libs/merge/HRUtils';
import {getConnectedATSProvider} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Beta} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {MergeProviderCardCategory} from './types';

/** The handful of things that differ between the HR results screen and the Recruiting one. Everything else is shared. */
const PAGE_CONFIG = {
    [CONST.POLICY.CONNECTIONS.CATEGORY.HR]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path,
        testID: 'DynamicHRSyncResultsPage',
        getProviderDisplayName: (policy: OnyxEntry<Policy>) => getConnectedHRProvider(policy)?.displayName ?? '',
        shouldBeBlocked: () => false,
    },
    [CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING]: {
        featureName: CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED,
        dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_RECRUITING_SYNC_RESULTS.path,
        testID: 'DynamicRecruitingSyncResultsPage',
        getProviderDisplayName: (policy: OnyxEntry<Policy>) => getConnectedATSProvider(policy)?.displayName ?? '',
        shouldBeBlocked: (isBetaEnabled: (beta: Beta) => boolean) => !isBetaEnabled(CONST.BETAS.MERGE_ATS),
    },
} as const;

type MergeSyncResultsPageBaseProps = {
    /** The workspace whose sync just finished. */
    policyID: string;

    /** Which category synced. Picks the category-specific copy, feature flag, and connected-provider lookup. */
    category: MergeProviderCardCategory;
};

function MergeSyncResultsPageBase({policyID, category}: MergeSyncResultsPageBaseProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const illustrations = useMemoizedLazyIllustrations(['SyncUsers']);
    const [isSkippedSectionExpanded, setIsSkippedSectionExpanded] = useState(false);

    const {featureName, dynamicRoutePath, testID, shouldBeBlocked, getProviderDisplayName} = PAGE_CONFIG[category];
    const backPath = useDynamicBackPath(dynamicRoutePath);

    const [providerDisplayName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: getProviderDisplayName,
    });
    // The sync payload already lives in Onyx, so this screen only needs the policy ID in its route
    // params — the result itself never has to travel through navigation state.
    const [result] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {
        selector: (connectionSyncProgress) => connectionSyncProgress?.result,
    });

    const addedCount = result?.addedEmployeesCount ?? 0;
    const removedCount = result?.removedEmployeesCount ?? 0;
    const skippedCount = result?.skippedEmployees?.length ?? 0;

    const goBack = () => Navigation.goBack(backPath);

    const renderResultSummary = (label: string, count: number) => (
        <View style={[styles.mb6]}>
            <Text style={[styles.textSupporting, styles.mb1]}>{label}</Text>
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate(`workspace.${category}.syncResults.importedCount`, {count})}</Text>
        </View>
    );

    return (
        // Deep-linkable, so it must gate on the category's workspace access — otherwise a user without it could
        // open this URL and read the skipped-records list straight from Onyx.
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={featureName}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={shouldBeBlocked(isBetaEnabled)}
        >
            <ScreenWrapper
                testID={testID}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.merge.syncResults.title', providerDisplayName)}
                    onBackButtonPress={goBack}
                />
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb8]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.alignItemsCenter, styles.mt4, styles.mb4, styles.pRelative]}>
                        <Icon
                            src={illustrations.SyncUsers}
                            width={68}
                            height={68}
                        />
                    </View>
                    <Text style={[styles.textHeadlineH1, styles.mb8]}>{translate('workspace.merge.syncResults.successTitle', providerDisplayName)}</Text>
                    {renderResultSummary(translate('workspace.merge.syncResults.added'), addedCount)}
                    {renderResultSummary(translate('workspace.merge.syncResults.removed'), removedCount)}
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('workspace.merge.syncResults.skipped')}
                        sentryLabel={`${testID}-SkippedEmployees`}
                        role={CONST.ROLE.BUTTON}
                        onPress={() => setIsSkippedSectionExpanded((isExpanded) => !isExpanded)}
                        style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
                    >
                        <View>
                            <Text style={[styles.textSupporting, styles.mb1]}>{translate('workspace.merge.syncResults.skipped')}</Text>
                            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate(`workspace.${category}.syncResults.importedCount`, {count: skippedCount})}</Text>
                        </View>
                        <Icon
                            src={icons.DownArrow}
                            fill={theme.icon}
                            additionalStyles={isSkippedSectionExpanded ? styles.flipUpsideDown : undefined}
                        />
                    </PressableWithoutFeedback>
                    {isSkippedSectionExpanded &&
                        result?.skippedEmployees?.map((employee) => (
                            <View
                                key={employee.id}
                                style={[styles.mt4]}
                            >
                                <Text style={[styles.textNormalThemeText, styles.textStrong]}>{employee.name}</Text>
                                <Text style={[styles.textSupporting]}>{employee.reason}</Text>
                            </View>
                        ))}
                </ScrollView>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={goBack}
                    >
                        <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeSyncResultsPageBase;
