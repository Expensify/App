import React, {useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CollapsibleSection from '@components/CollapsibleSection';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToXeroButton from '@components/ConnectToXeroButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ConnectToQuickbooksOnlineButton from './qboConnectionButton';

type WorkspaceAccountingPageOnyxProps = {
    /** From Onyx */
    /** Bank account attached to free plan */
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
};

type WorkspaceAccountingPageProps = WithPolicyAndFullscreenLoadingProps &
    WorkspaceAccountingPageOnyxProps & {
        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;
    };

// const AccountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);

function WorkspaceAccountingPage({policy, connectionSyncProgress}: WorkspaceAccountingPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);

    const isSyncInProgress = !!connectionSyncProgress?.stageInProgress && connectionSyncProgress.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
    const qboSyncInProgress = isSyncInProgress && connectionSyncProgress.connectionName === 'quickbooksOnline';
    const xeroSyncInProgress = isSyncInProgress && connectionSyncProgress.connectionName === 'xero';
    const policyConnectedToQbo = !!policy?.connections?.quickbooksOnline;
    const policyConnectedToXero = !!policy?.connections?.xero;
    const policyID = policy?.id ?? '';

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Sync,
                text: translate('workspace.accounting.syncNow'),
                onSelected: () => {},
            },
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: () => setIsDisconnectModalOpen(true),
            },
        ],
        [translate],
    );

    const connectionsMenuItems: MenuItemProps[] = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress) {
            return [
                {
                    icon: Expensicons.QBOSquare,
                    iconType: 'avatar',
                    interactive: false,
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    shouldShowRightComponent: true,
                    title: translate('workspace.accounting.qbo'),
                    rightComponent: (
                        <ConnectToQuickbooksOnlineButton
                            policyID={policyID}
                            environmentURL={environmentURL}
                        />
                    ),
                },
                {
                    icon: Expensicons.XeroSquare,
                    iconType: 'avatar',
                    interactive: false,
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    shouldShowRightComponent: true,
                    title: translate('workspace.accounting.xero'),
                    rightComponent: (
                        <ConnectToXeroButton
                            policyID={policyID}
                            environmentURL={environmentURL}
                        />
                    ),
                },
            ];
        }

        return [
            {
                icon: qboSyncInProgress || policyConnectedToQbo ? Expensicons.QBOSquare : Expensicons.XeroSquare,
                iconType: 'avatar',
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                shouldShowRightComponent: true,
                title: qboSyncInProgress || policyConnectedToQbo ? translate('workspace.accounting.qbo') : translate('workspace.accounting.xero'),
                description: qboSyncInProgress
                    ? translate('workspace.accounting.connections.syncStageName', connectionSyncProgress.stageInProgress)
                    : translate('workspace.accounting.lastSync'),
                rightComponent: isSyncInProgress ? (
                    <ActivityIndicator
                        style={[styles.popoverMenuIcon]}
                        color={theme.spinner}
                    />
                ) : (
                    <View ref={threeDotsMenuContainerRef}>
                        <ThreeDotsMenu
                            onIconPress={() => {
                                threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                                    setThreeDotsMenuPosition({
                                        horizontal: x + width,
                                        vertical: y + height,
                                    });
                                });
                            }}
                            menuItems={overflowMenu}
                            anchorPosition={threeDotsMenuPosition}
                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                        />
                    </View>
                ),
            },
            ...(policyConnectedToQbo || policyConnectedToXero
                ? [
                      {
                          icon: Expensicons.Pencil,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.import'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => {},
                      },
                      {
                          icon: Expensicons.Send,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.export'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => {},
                      },
                      {
                          icon: Expensicons.Gear,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.advanced'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => {},
                      },
                  ]
                : []),
        ];
    }, [
        connectionSyncProgress?.stageInProgress,
        environmentURL,
        isSyncInProgress,
        overflowMenu,
        policyConnectedToQbo,
        policyConnectedToXero,
        policyID,
        qboSyncInProgress,
        styles.popoverMenuIcon,
        styles.sectionMenuItemTopDescription,
        theme.spinner,
        threeDotsMenuPosition,
        translate,
    ]);

    const otherIntegrationsItem = useMemo(() => {
        if (qboSyncInProgress || policyConnectedToQbo) {
            return {
                icon: Expensicons.XeroSquare,
                title: translate('workspace.accounting.xero'),
                rightComponent: (
                    <ConnectToXeroButton
                        policyID={policyID}
                        environmentURL={environmentURL}
                    />
                ),
            };
        }
        if (xeroSyncInProgress || policyConnectedToXero) {
            return {
                icon: Expensicons.QBOSquare,
                title: translate('workspace.accounting.qbo'),
                rightComponent: (
                    <ConnectToQuickbooksOnlineButton
                        policyID={policyID}
                        environmentURL={environmentURL}
                    />
                ),
            };
        }
    }, [environmentURL, policyConnectedToQbo, policyConnectedToXero, policyID, qboSyncInProgress, translate, xeroSyncInProgress]);

    const headerThreeDotsMenuItems: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: Expensicons.Key,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            text: translate('workspace.accounting.enterCredentials'),
            onSelected: () => {},
        },
        {
            icon: Expensicons.Trashcan,
            text: translate('workspace.accounting.disconnect'),
            onSelected: () => setIsDisconnectModalOpen(true),
        },
    ];

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                >
                    <ScreenWrapper
                        testID={WorkspaceAccountingPage.displayName}
                        includeSafeAreaPaddingBottom={false}
                        shouldShowOfflineIndicatorInWideScreen
                    >
                        <HeaderWithBackButton
                            title={translate('workspace.common.accounting')}
                            shouldShowBackButton={isSmallScreenWidth}
                            icon={Illustrations.Accounting}
                            shouldShowThreeDotsButton
                            threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                            threeDotsMenuItems={headerThreeDotsMenuItems}
                        />
                        <ScrollView contentContainerStyle={styles.pt3}>
                            <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                                <Section
                                    title={translate('workspace.accounting.title')}
                                    subtitle={translate('workspace.accounting.subtitle')}
                                    isCentralPane
                                    subtitleMuted
                                    titleStyles={styles.accountSettingsSectionTitle}
                                    childrenStyles={styles.pt5}
                                >
                                    <MenuItemList
                                        menuItems={connectionsMenuItems}
                                        shouldUseSingleExecution
                                    />
                                    {otherIntegrationsItem && (
                                        <CollapsibleSection
                                            title="Other integrations"
                                            wrapperStyle={styles.pr3}
                                            titleStyle={[styles.textNormal, styles.colorMuted]}
                                        >
                                            <MenuItem
                                                icon={otherIntegrationsItem.icon}
                                                iconType="avatar"
                                                interactive={false}
                                                shouldShowRightComponent
                                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                                title={otherIntegrationsItem.title}
                                                rightComponent={otherIntegrationsItem.rightComponent}
                                            />
                                        </CollapsibleSection>
                                    )}
                                </Section>
                            </View>
                        </ScrollView>
                        <ConfirmModal
                            title={translate('workspace.accounting.disconnectTitle')}
                            isVisible={isDisconnectModalOpen}
                            onConfirm={() => {}}
                            onCancel={() => setIsDisconnectModalOpen(false)}
                            prompt={translate('workspace.accounting.disconnectPrompt')}
                            confirmText={translate('workspace.accounting.disconnect')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceAccountingPage.displayName = 'WorkspaceAccountingPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceAccountingPageProps, WorkspaceAccountingPageOnyxProps>({
        connectionSyncProgress: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${props.route.params.policyID}`,
        },
    })(WorkspaceAccountingPage),
);
