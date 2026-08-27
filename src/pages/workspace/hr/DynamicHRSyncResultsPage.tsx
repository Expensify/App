/**
 * Shows the outcome of a finished HR provider sync (employees added, removed and skipped).
 *
 * The sync payload is read from Onyx (the policy's connection sync progress), so only the workspace's
 * `policyID` needs to travel through the route.
 */
import Button from '@components/ButtonComposed';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getConnectedHRProvider} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

type DynamicHRSyncResultsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_HR_SYNC_RESULTS>;

function DynamicHRSyncResultsPage({route}: DynamicHRSyncResultsPageProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const illustrations = useMemoizedLazyIllustrations(['SyncUsers']);
    const [isSkippedSectionExpanded, setIsSkippedSectionExpanded] = useState(false);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path);

    const policyID = route.params.policyID;
    const [providerDisplayName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => getConnectedHRProvider(policy)?.displayName ?? '',
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
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.syncResults.employeeCount', {count})}</Text>
        </View>
    );

    return (
        // Deep-linkable, so it must gate on workspace HR access — otherwise a user without it could
        // open this URL and read the skipped-employee list straight from Onyx.
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
        >
            <ScreenWrapper
                testID="DynamicHRSyncResultsPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.syncResults.title', providerDisplayName)}
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
                    <Text style={[styles.textHeadlineH1, styles.mb8]}>{translate('workspace.hr.syncResults.successTitle', providerDisplayName)}</Text>
                    {renderResultSummary(translate('workspace.hr.syncResults.added'), addedCount)}
                    {renderResultSummary(translate('workspace.hr.syncResults.removed'), removedCount)}
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('workspace.hr.syncResults.skipped')}
                        sentryLabel="DynamicHRSyncResultsPage-SkippedEmployees"
                        role={CONST.ROLE.BUTTON}
                        onPress={() => setIsSkippedSectionExpanded((isExpanded) => !isExpanded)}
                        style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
                    >
                        <View>
                            <Text style={[styles.textSupporting, styles.mb1]}>{translate('workspace.hr.syncResults.skipped')}</Text>
                            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.syncResults.employeeCount', {count: skippedCount})}</Text>
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

export default DynamicHRSyncResultsPage;
