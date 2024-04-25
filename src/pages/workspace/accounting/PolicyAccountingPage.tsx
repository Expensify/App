import React, {useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToQuickbooksOnlineButton from '@components/ConnectToQuickbooksOnlineButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {removePolicyConnection} from '@libs/actions/connections';
import {syncConnection} from '@libs/actions/connections/QuickBooksOnline';
import Navigation from '@navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';

type PolicyAccountingPageOnyxProps = {
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
};

type PolicyAccountingPageProps = WithPolicyProps &
    PolicyAccountingPageOnyxProps & {
        // This is not using OnyxEntry<OnyxTypes.Policy> because the HOC withPolicyConnections will only render this component if there is a policy
        policy: Policy;
    };

function PolicyAccountingPage({policy, connectionSyncProgress}: PolicyAccountingPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);
    const isSyncInProgress = !!connectionSyncProgress?.stageInProgress && connectionSyncProgress.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
    const policyIsConnectedToAccountingSystem = Object.keys(policy.connections ?? {}).length > 0;
    const policyID = policy.id ?? '';

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Sync,
                text: translate('workspace.accounting.syncNow'),
                onSelected: () => syncConnection(policyID),
                disabled: isOffline,
            },
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: () => setIsDisconnectModalOpen(true),
            },
        ],
        [translate, policyID, isOffline],
    );

    const menuItems: MenuItemProps[] = useMemo(() => {
        if (!policyIsConnectedToAccountingSystem && !isSyncInProgress) {
            return [
                {
                    icon: Expensicons.QBOSquare,
                    iconType: CONST.ICON_TYPE_AVATAR,
                    interactive: false,
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    shouldShowRightComponent: true,
                    title: translate('workspace.accounting.qbo'),
                    rightComponent: <ConnectToQuickbooksOnlineButton policyID={policyID} />,
                },
            ];
        }
        return [
            {
                icon: Expensicons.QBOSquare,
                iconType: 'avatar',
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                shouldShowRightComponent: true,
                title: translate('workspace.accounting.qbo'),
                description: isSyncInProgress
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
            ...(policyIsConnectedToAccountingSystem
                ? [
                      {
                          icon: Expensicons.Pencil,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.import'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)),
                      },
                      {
                          icon: Expensicons.Send,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.export'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                      },
                      {
                          icon: Expensicons.Gear,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.advanced'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)),
                      },
                  ]
                : []),
        ];
    }, [
        connectionSyncProgress?.stageInProgress,
        isSyncInProgress,
        overflowMenu,
        policyID,
        policyIsConnectedToAccountingSystem,
        styles.popoverMenuIcon,
        styles.sectionMenuItemTopDescription,
        theme.spinner,
        threeDotsMenuPosition,
        translate,
    ]);

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
                        testID={PolicyAccountingPage.displayName}
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
                                        menuItems={menuItems}
                                        shouldUseSingleExecution
                                    />
                                </Section>
                            </View>
                        </ScrollView>
                        <ConfirmModal
                            title={translate('workspace.accounting.disconnectTitle')}
                            isVisible={isDisconnectModalOpen}
                            onConfirm={() => {
                                removePolicyConnection(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO);
                                setIsDisconnectModalOpen(false);
                            }}
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

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default withPolicyConnections(
    withOnyx<PolicyAccountingPageProps, PolicyAccountingPageOnyxProps>({
        connectionSyncProgress: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${props.route.params.policyID}`,
        },
    })(PolicyAccountingPage),
);
