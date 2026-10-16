import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import CollapsibleSection from '@components/CollapsibleSection';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import getPlatform from '@libs/getPlatform';
import {hasAccountingConnections, isControlPolicy} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withUnifiedConnectionsBeta from '@pages/workspace/connections/withUnifiedConnectionsBeta';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';

import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';

import type {MenuItemData, PolicyAccountingPageProps} from './types';

import {AccountingContextProvider, useAccountingActions, useAccountingState} from './AccountingContext';
import useConnectedAccountingIntegration from './useConnectedAccountingIntegration';

type RouteParams = {
    newConnectionName?: ConnectionName;
    integrationToDisconnect?: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    isIntuitEnterpriseSuite?: string;
};

function PolicyAccountingPage({policy}: PolicyAccountingPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.accounting');
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {popoverAnchorRefs} = useAccountingState();
    const {startIntegrationFlow} = useAccountingActions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {isLargeScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    const newConnectionName = params?.newConnectionName;
    const integrationToDisconnect = params?.integrationToDisconnect;
    const shouldDisconnectIntegrationBeforeConnecting = params?.shouldDisconnectIntegrationBeforeConnecting;
    const shouldConnectToIntuitEnterpriseSuite = params?.isIntuitEnterpriseSuite === 'true';
    const policyID = policy?.id;
    const icons = useMemoizedLazyExpensifyIcons(['QuestionMark']);
    const {
        accountingIntegrations,
        connectedIntegration,
        isConnectedToIntuitEnterpriseSuite,
        isSyncInProgress,
        hasAccountingConnection,
        hasSyncError,
        hasUnsupportedNDIntegration,
        synchronizationError,
        canWriteAccounting,
        showReadOnlyModal,
        overflowMenu,
        connectionDetails,
        qboTokenExpiryHint,
        oldDotPolicyConnectionsURL,
        getAvailableIntegrationData,
    } = useConnectedAccountingIntegration(policy, {menuItemWrapperStyle: [styles.sectionMenuItemTopDescription]});
    const accountingIntegrationOptions = accountingIntegrations.flatMap((name) => [
        {name, isIntuitEnterpriseSuite: name === CONST.POLICY.CONNECTIONS.NAME.QBO ? false : undefined},
        ...(name === CONST.POLICY.CONNECTIONS.NAME.QBO ? [{name, isIntuitEnterpriseSuite: true}] : []),
    ]);
    const shouldShowSynchronizationError = !!synchronizationError;

    // `startIntegrationFlow` changes identity whenever `policy` does, which re-runs this effect. The
    // Navigation.setParams below clears newConnectionName through a navigation state update that lands in a later
    // render, so that re-run can still see the param set. Key the guard on the value to start the flow only once.
    const startedIntegrationFlowForRef = useRef<ConnectionName | undefined>(undefined);

    useFocusEffect(
        useCallback(() => {
            if (!newConnectionName || !isControlPolicy(policy) || !canWriteAccounting) {
                // Re-arm the guard once the param is gone, so a later round-trip that asks for the same integration
                // again is not mistaken for the re-run this guard exists to swallow.
                if (!newConnectionName) {
                    startedIntegrationFlowForRef.current = undefined;
                }
                return;
            }

            if (startedIntegrationFlowForRef.current === newConnectionName) {
                return;
            }
            startedIntegrationFlowForRef.current = newConnectionName;

            startIntegrationFlow({
                name: newConnectionName,
                isIntuitEnterpriseSuite: shouldConnectToIntuitEnterpriseSuite,
                integrationToDisconnect,
                shouldDisconnectIntegrationBeforeConnecting,
            });
            Navigation.setParams({
                newConnectionName: undefined,
                isIntuitEnterpriseSuite: undefined,
                integrationToDisconnect: undefined,
                shouldDisconnectIntegrationBeforeConnecting: undefined,
            });
        }, [newConnectionName, shouldConnectToIntuitEnterpriseSuite, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting, policy, startIntegrationFlow, canWriteAccounting]),
    );

    const getConnectionsMenuItems = (): MenuItemData[] => {
        if (!hasAccountingConnection && !isSyncInProgress && policyID) {
            return accountingIntegrationOptions
                .map(({name: integration, isIntuitEnterpriseSuite}) => {
                    const integrationData = getAvailableIntegrationData(integration, isIntuitEnterpriseSuite);
                    if (!integrationData) {
                        return undefined;
                    }

                    const isXero = integration === CONST.POLICY.CONNECTIONS.NAME.XERO;
                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    return {
                        ...iconProps,
                        interactive: false,
                        // On native iOS, `accessible={true}` collapses the row and all its descendants into a single accessibility element,
                        // so VoiceOver focuses the whole row instead of the nested Connect button. Disabling it only on native iOS lets
                        // VoiceOver focus/activate the button on its own. Other platforms (Android/TalkBack, web, iOS mWeb→WEB) keep grouping.
                        shouldBeAccessible: getPlatform() !== CONST.PLATFORM.IOS,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        badgeText: isXero ? translate('workspace.accounting.claimOffer.badgeText') : undefined,
                        onBadgePress:
                            isXero && canWriteAccounting
                                ? () => {
                                      Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO));
                                  }
                                : undefined,
                        badgeStyle: styles.mr3,
                        isBadgeSuccess: isXero,
                        shouldShowBadgeBelow: shouldUseNarrowLayout,
                        rightComponent: (
                            <ButtonDisabledWhenOffline
                                onPress={() => {
                                    if (!canWriteAccounting) {
                                        showReadOnlyModal();
                                        return;
                                    }
                                    startIntegrationFlow({name: integration, isIntuitEnterpriseSuite});
                                }}
                                style={styles.justifyContentCenter}
                                innerStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                hoverStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                size={CONST.BUTTON_SIZE.SMALL}
                                ref={(ref) => {
                                    if (!popoverAnchorRefs?.current) {
                                        return;
                                    }
                                    const integrationKey = isIntuitEnterpriseSuite ? CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE : integration;
                                    popoverAnchorRefs.current[integrationKey].current = ref;
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SETUP_BUTTON}
                            >
                                <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                            </ButtonDisabledWhenOffline>
                        ),
                    };
                })
                .filter(Boolean) as MenuItemData[];
        }

        if (!connectionDetails) {
            return [];
        }
        const iconProps = connectionDetails.icon ? {icon: connectionDetails.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

        let rightComponent;
        if (isSyncInProgress) {
            rightComponent = <ActivityIndicator style={[styles.popoverMenuIcon]} />;
        } else if (canWriteAccounting) {
            rightComponent = (
                <ThreeDotsMenu
                    shouldSelfPosition
                    menuItems={overflowMenu}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.THREE_DOT_MENU}
                />
            );
        }

        return [
            {
                ...iconProps,
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription, shouldShowSynchronizationError && styles.pb0],
                shouldShowRightComponent: true,
                title: connectionDetails.title,
                errorText: synchronizationError,
                errorTextStyle: [styles.mt5],
                shouldShowRedDotIndicator: true,
                description: connectionDetails.connectionMessage,
                hintText: qboTokenExpiryHint,
                rightComponent,
            },
            ...connectionDetails.settingsMenuItems,
        ];
    };
    const connectionsMenuItems = getConnectionsMenuItems();

    const getOtherIntegrationsItems = () => {
        if ((!hasAccountingConnection && !isSyncInProgress) || !policyID) {
            return;
        }
        const otherIntegrations = accountingIntegrationOptions.filter(
            ({name, isIntuitEnterpriseSuite}) => name !== connectedIntegration || !!isIntuitEnterpriseSuite !== isConnectedToIntuitEnterpriseSuite,
        );
        return otherIntegrations
            .map(({name: integration, isIntuitEnterpriseSuite}) => {
                const integrationData = getAvailableIntegrationData(integration, isIntuitEnterpriseSuite);
                if (!integrationData) {
                    return undefined;
                }

                const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

                return {
                    ...iconProps,
                    title: integrationData?.title,
                    rightComponent: (
                        <ButtonDisabledWhenOffline
                            onPress={() => {
                                if (!canWriteAccounting) {
                                    showReadOnlyModal();
                                    return;
                                }
                                startIntegrationFlow({
                                    name: integration,
                                    isIntuitEnterpriseSuite,
                                    integrationToDisconnect: connectedIntegration,
                                    shouldDisconnectIntegrationBeforeConnecting: true,
                                });
                            }}
                            style={styles.justifyContentCenter}
                            innerStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                            hoverStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                            size={CONST.BUTTON_SIZE.SMALL}
                            ref={(r) => {
                                if (!popoverAnchorRefs?.current) {
                                    return;
                                }
                                const integrationKey = isIntuitEnterpriseSuite ? CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE : integration;
                                popoverAnchorRefs.current[integrationKey].current = r;
                            }}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SETUP_BUTTON}
                        >
                            <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                        </ButtonDisabledWhenOffline>
                    ),
                    interactive: false,
                    // On native iOS, `accessible={true}` collapses the row and all its descendants into a single accessibility element,
                    // so VoiceOver focuses the whole row instead of the nested Connect button. Disabling it only on native iOS lets
                    // VoiceOver focus/activate the button on its own. Other platforms (Android/TalkBack, web, iOS mWeb→WEB) keep grouping.
                    shouldBeAccessible: getPlatform() !== CONST.PLATFORM.IOS,
                    shouldShowRightComponent: true,
                    wrapperStyle: styles.sectionMenuItemTopDescription,
                };
            })
            .filter(Boolean) as MenuItemWithLink[];
    };
    const otherIntegrationsItems = getOtherIntegrationsItems();

    const [chatTextLink, chatReportID] = useMemo(() => {
        // If they have an onboarding specialist assigned display the following and link to the #admins room with the account executive.
        if (policy?.chatReportIDAdmins) {
            return [translate('workspace.accounting.talkYourOnboardingSpecialist'), policy?.chatReportIDAdmins?.toString()];
        }

        // If not, if they have an account manager assigned display the following and link to the DM with their account manager.
        if (account?.accountManagerAccountID) {
            return [translate('workspace.accounting.talkYourAccountManager'), account?.accountManagerReportID];
        }
        // Else, display the following and link to their Concierge DM.
        return [translate('workspace.accounting.talkToConcierge'), conciergeReportID];
    }, [account?.accountManagerAccountID, account?.accountManagerReportID, conciergeReportID, policy?.chatReportIDAdmins, translate]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.ACCOUNTING}
        >
            <ScreenWrapper
                testID="PolicyAccountingPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.accounting')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                    shouldDisplayHelpButton
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView
                    contentContainerStyle={styles.pt3}
                    addBottomSafeAreaPadding
                >
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('workspace.accounting.title')}
                            subtitle={translate('workspace.accounting.subtitle')}
                            isCentralPane
                            subtitleMuted
                            titleStyles={styles.accountSettingsSectionTitle}
                            childrenStyles={styles.pt5}
                        >
                            {!hasUnsupportedNDIntegration &&
                                connectionsMenuItems.map((menuItem) => (
                                    <OfflineWithFeedback
                                        pendingAction={menuItem.pendingAction}
                                        key={menuItem.title}
                                        shouldDisableStrikeThrough
                                    >
                                        <MenuItem
                                            brickRoadIndicator={menuItem.brickRoadIndicator}
                                            key={menuItem.title}
                                            {...menuItem}
                                        />
                                    </OfflineWithFeedback>
                                ))}
                            {hasUnsupportedNDIntegration && hasSyncError && !!policyID && (
                                <FormHelpMessage
                                    isError
                                    style={styles.menuItemError}
                                    message={translate('workspace.accounting.errorODIntegration', oldDotPolicyConnectionsURL)}
                                    shouldRenderMessageAsHTML
                                />
                            )}
                            {hasUnsupportedNDIntegration && !hasSyncError && !!policyID && (
                                <FormHelpMessage shouldShowRedDotIndicator={false}>
                                    <Text>
                                        <TextLink
                                            onPress={() => {
                                                // Go to Expensify Classic.
                                                openOldDotLink(CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
                                            }}
                                        >
                                            {translate('workspace.accounting.goToODToSettings')}
                                        </TextLink>
                                    </Text>
                                </FormHelpMessage>
                            )}
                            {!!otherIntegrationsItems && (
                                <CollapsibleSection
                                    title={translate('workspace.accounting.other')}
                                    wrapperStyle={[styles.pr3, styles.mt5, styles.pv3]}
                                    titleStyle={[styles.textNormal, styles.colorMuted]}
                                    textStyle={[styles.flex1, styles.userSelectNone, styles.textNormal, styles.colorMuted]}
                                >
                                    <MenuItemList
                                        menuItems={otherIntegrationsItems}
                                        shouldUseSingleExecution
                                    />
                                </CollapsibleSection>
                            )}
                            {!!account?.guideDetails?.email && !hasAccountingConnections(policy) && canWriteAccounting && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt7]}>
                                    <Icon
                                        src={icons.QuestionMark}
                                        width={20}
                                        height={20}
                                        fill={theme.icon}
                                        additionalStyles={styles.mr3}
                                    />
                                    <View style={[!isLargeScreenWidth ? styles.flexColumn : styles.flexRow]}>
                                        <Text style={styles.textSupporting}>{translate('workspace.accounting.needAnotherAccounting')}</Text>
                                        <TextLink onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(String(chatReportID)))}>{chatTextLink}</TextLink>
                                    </View>
                                </View>
                            )}
                        </Section>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function PolicyAccountingPageWrapper(props: PolicyAccountingPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <PolicyAccountingPage {...props} />
        </AccountingContextProvider>
    );
}

export default withUnifiedConnectionsBeta(withPolicyConnections(PolicyAccountingPageWrapper));
