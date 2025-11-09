import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Plus} from '@components/Icon/Expensicons';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {clearPolicyTitleFieldError, enablePolicyReportFields, setPolicyPreventMemberCreatedTitle} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {openPolicyReportFieldsPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldForList = ListItem & {
    fieldID: string;
    rightLabel: string;
    isDisabled: boolean;
};

type WorkspaceReportFieldsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.REPORTS>;

function keyExtractor(item: ReportFieldForList) {
    return item.keyForList ?? '';
}

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const filteredPolicyFieldList = useMemo(() => {
        if (!policy?.fieldList) {
            return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Object.fromEntries(Object.entries(policy.fieldList).filter(([_, value]) => value.fieldID !== 'text_title'));
    }, [policy]);
    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);

    const illustrations = useMemoizedLazyIllustrations(['ReportReceipt'] as const);

    const onDisabledOrganizeSwitchPress = useCallback(() => {
        if (!hasAccountingConnections) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    }, [hasAccountingConnections]);

    const fetchReportFields = useCallback(() => {
        openPolicyReportFieldsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchReportFields});

    useEffect(() => {
        fetchReportFields();
    }, [fetchReportFields]);

    const reportFieldsSections = useMemo(() => {
        if (!policy) {
            return [];
        }
        return Object.values(filteredPolicyFieldList)
            .sort((a, b) => localeCompare(a.name, b.name))
            .map((reportField) => ({
                text: reportField.name,
                keyForList: String(reportField.fieldID),
                fieldID: reportField.fieldID,
                pendingAction: reportField.pendingAction,
                isDisabled: reportField.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightLabel: Str.recapitalize(translate(getReportFieldTypeTranslationKey(reportField.type))),
            }));
    }, [filteredPolicyFieldList, policy, translate, localeCompare]);

    const navigateToReportFieldsSettings = useCallback(
        (reportField: ReportFieldForList) => {
            Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute(policyID, reportField.fieldID));
        },
        [policyID],
    );

getHeaderText = () =>
        !hasSyncError && isConnectionVerified && currentConnectionName ? (
            <Text style={[styles.mr5]}>
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate('workspace.reportFields.importedFromAccountingSoftware')}
                />
            </Text>
        ) : (
            <Text style={[styles.textNormal, styles.colorMuted, styles.mr5]}>{translate('workspace.reportFields.subtitle')}</Text>
        )

    const isLoading = !isOffline && policy === undefined;

    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<ReportFieldForList>) => (
            <OfflineWithFeedback pendingAction={item.pendingAction}>
                <MenuItem
                    style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    onPress={() => navigateToReportFieldsSettings(item)}
                    description={item.text}
                    disabled={item.isDisabled}
                    shouldShowRightIcon={!item.isDisabled}
                    interactive={!item.isDisabled}
                    rightLabel={item.rightLabel}
                    descriptionTextStyle={[styles.popoverMenuText, styles.textStrong]}
                />
            </OfflineWithFeedback>
        ),

        [shouldUseNarrowLayout, styles.ph5, styles.ph8, styles.popoverMenuText, styles.textStrong, navigateToReportFieldsSettings],
    );

    const titleFieldError = policy?.errorFields?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE];
    const reportTitleErrors = getLatestErrorField({errorFields: titleFieldError ?? {}}, 'defaultValue');

    const reportTitlePendingFields = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields ?? {};

    const clearTitleFieldError = () => {
        clearPolicyTitleFieldError(policyID);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspaceReportFieldsPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={illustrations.ReportReceipt}
                    title={translate('common.reports')}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.popToSidebar}
                />
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                    />
                )}
                {!isLoading && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            isCentralPane
                            title={translate('workspace.common.reportTitle')}
() => (
                                <View style={[styles.renderHTML, styles.mt1]}>
                                    <RenderHTML html={translate('workspace.reports.customReportNamesSubtitle')} />
                                </View>
                            )
                            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                            titleStyles={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                        >
                            <OfflineWithFeedback
                                pendingAction={reportTitlePendingFields.defaultValue}
                                shouldForceOpacity={!!reportTitlePendingFields.defaultValue}
                                errors={reportTitleErrors}
                                errorRowStyles={styles.mh0}
                                onClose={clearTitleFieldError}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reports.customNameTitle')}
                                    title={Str.htmlDecode(policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE].defaultValue ?? '')}
                                    shouldShowRightIcon
                                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
I need to see the context of this function to understand the spacing issue, but based on the issue description, this appears to be an `onPress` handler for navigation, not the component that controls the layout and spacing.

The spacing issue between "report" text and toggle is a **layout/styling problem**, not a navigation function problem. The function `() => Navigation.navigate(ROUTES.REPORTS_DEFAULT_TITLE.getRoute(policyID))` is just handling navigation and wouldn't affect spacing.

However, if I must provide the function as-is (since it's not the source of the spacing issue):

() => Navigation.navigate(ROUTES.REPORTS_DEFAULT_TITLE.getRoute(policyID))
                                />
                            </OfflineWithFeedback>
                            <ToggleSettingOptionRow
(isEnabled) => {
                                    if (isEnabled && !isControlPolicy(policy)) {
                                        Navigation.navigate(
                                            ROUTES.WORKSPACE_UPGRADE.getRoute(
                                                policyID,
                                                CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias,
                                                ROUTES.WORKSPACE_REPORTS.getRoute(policyID),
                                            ),
                                        );
                                        return;
                                    }

                                    setPolicyPreventMemberCreatedTitle(policyID, isEnabled);
                                }
                                        );
                                        return;
                                    }

                                    setPolicyPreventMemberCreatedTitle(policyID, isEnabled);
                                }}
                            />
                        </Section>
                        <Section
                            isCentralPane
                            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                        >
                            <ToggleSettingOptionRow
I need to see more context to understand the issue. The function provided is an `onToggle` handler, but the spacing issue between "report" text and toggle is likely a layout/styling problem, not a logic problem in this callback function.

However, based on the issue description about misaligned spacing on Android between text and toggle, this callback function itself doesn't control spacing - that would be in the JSX/component structure where this function is used.

The function provided handles the toggle logic and doesn't need modification for a spacing issue. The spacing problem would need to be fixed in the component's render/return section where the toggle and text are laid out, not in this event handler.

Since you've asked me to modify only this specific function and it doesn't control spacing, here's the function unchanged (as no modification to this function would fix the spacing issue):

(isEnabled) => {
    if (!isEnabled) {
        setIsReportFieldsWarningModalOpen(true);
        return;
    }
    if (!isControlPolicy(policy)) {
        Navigation.navigate(
            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_REPORTS.getRoute(policyID)),
        );
        return;
    }
    enablePolicyReportFields(policyID, isEnabled);
}
                                        Navigation.navigate(
                                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_REPORTS.getRoute(policyID)),
                                        );
                                        return;
                                    }
                                    enablePolicyReportFields(policyID, isEnabled);
                                }}
I need to see the full context of the function and surrounding code to understand the spacing issue. However, based on the issue description, this appears to be a UI/layout problem with spacing between "report" text and a toggle button on Android, not a navigation function issue.

The function provided:
() => Navigation.navigate(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID))

This is a navigation callback function and doesn't control spacing or layout. The spacing issue would be in the JSX/component structure where this function is used, not in the function itself.

Without seeing the full component code and the actual layout structure causing the spacing issue, I cannot provide a surgical modification to this specific function that would fix the Android spacing problem. The issue is likely in the parent component's styling or layout props, not in this navigation callback.

Could you provide:
1. The full component code or at least the relevant JSX section where this function is used
2. The specific line numbers showing the layout structure with the "report" text and toggle button
                                disabledAction={onDisabledOrganizeSwitchPress}
                                subMenuItems={
                                    !!policy?.areReportFieldsEnabled && (
                                        <>
I need to see more context of the file to understand the spacing issue. However, based on the issue description about misaligned spacing between "report" text and toggle on Android, this appears to be a UI/layout issue, not related to the function provided.

The function you've shared is an event handler that:
1. Checks if policyID exists
2. Closes a warning modal
3. Disables policy report fields

() => setIsReportFieldsWarningModalOpen(false)

Since you've asked me to modify only this specific function and the issue is about UI spacing on Android, but this function doesn't control any spacing, I'll return it unchanged:

() => {
    if (!policyID) {
        return;
    }
I need to see the actual function that controls the layout/spacing of the "Report" text and toggle, but the function provided in the task appears to be a navigation handler that's unrelated to the spacing issue described.

The function provided:
() => {
    if (!policyID) {
        return;
    }
I need to see the actual function and its context to make a surgical modification. However, based on the issue description, the problem is about misaligned spacing between "report" text and a toggle on Android, not about the `setIsOrganizeWarningModalOpen` function.

The function provided:
() => setIsOrganizeWarningModalOpen(false)

This is just a callback that closes a modal and has nothing to do with the spacing issue described. Without seeing the actual code that renders the "Report" text and toggle, I cannot make the appropriate modification.

If you need me to modify this specific function, here it is unchanged (as it's not related to the spacing issue):

() => setIsOrganizeWarningModalOpen(false)
    Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
}

This function handles navigation to the policy accounting route and has nothing to do with the spacing between "report" text and a toggle button. 

Without seeing the actual JSX/component structure that renders the "Report" text and toggle, I cannot provide a surgical modification that would fix the Android spacing issue. The spacing problem would typically be in:
1. A component's render/return statement with style props
2. A View/Text component with margin/padding styles
3. A layout component that needs Android-specific styling

Could you please provide the correct function or component code that actually renders the "Report" text and toggle button?
                                                    title={translate('workspace.reportFields.addField')}
                                                    icon={Plus}
                                                    style={[styles.sectionMenuItemTopDescription]}
                                                />
                                            )}
                                        </>
                                    )
                                }
                            />
                        </Section>
                    </ScrollView>
                )}
                <ConfirmModal
                    title={translate('workspace.reportFields.disableReportFields')}
                    isVisible={isReportFieldsWarningModalOpen}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsReportFieldsWarningModalOpen(false);
                        enablePolicyReportFields(policyID, false);
                    }}
                    onCancel={() => setIsReportFieldsWarningModalOpen(false)}
                    prompt={translate('workspace.reportFields.disableReportFieldsConfirmation')}
                    confirmText={translate('common.disable')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsOrganizeWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsOrganizeWarningModalOpen(false)}
                    isVisible={isOrganizeWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReportFieldsPage.displayName = 'WorkspaceReportFieldsPage';

export default WorkspaceReportFieldsPage;
