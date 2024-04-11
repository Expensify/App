import React, {useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToXeroButton from '@components/ConnectToXeroButton';
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
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {PolicyConnectionSyncProgressList} from '@src/types/onyx/Policy';
import ConnectToQuickbooksOnlineButton from './qboConnectionButton';

type WorkspaceAccountingPageOnyxProps = {
    /** From Onyx */
    /** Bank account attached to free plan */
    connectionSyncProgressList: OnyxEntry<PolicyConnectionSyncProgressList>;
};

type WorkspaceAccountingPageProps = WithPolicyAndFullscreenLoadingProps &
    WorkspaceAccountingPageOnyxProps & {
        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;
    };

function WorkspaceAccountingPage({policy, connectionSyncProgressList}: WorkspaceAccountingPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});

    const qboConnection = connectionSyncProgressList?.[CONST.POLICY.CONNECTIONS.NAME.QBO];
    const xeroConnection = connectionSyncProgressList?.[CONST.POLICY.CONNECTIONS.NAME.XERO];

    const qboSyncInProgress = qboConnection?.stageInProgress && qboConnection.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;
    const xeroSyncInProgress = xeroConnection?.stageInProgress && xeroConnection.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);

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

    const qboConnectionMenuItems: MenuItemProps[] = useMemo(
        () => [
            !qboConnection
                ? {
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
                  }
                : {
                      icon: Expensicons.QBOSquare,
                      iconType: 'avatar',
                      interactive: false,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      shouldShowRightComponent: true,
                      title: translate('workspace.accounting.qbo'),
                      description: qboSyncInProgress
                          ? translate('workspace.accounting.connections.syncStageName', qboConnection.stageInProgress)
                          : translate('workspace.accounting.lastSync'),
                      rightComponent: qboSyncInProgress ? (
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
            ...(qboConnection
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
        ],
        [
            qboConnection,
            qboSyncInProgress,
            styles.sectionMenuItemTopDescription,
            styles.popoverMenuIcon,
            translate,
            policyID,
            environmentURL,
            theme.spinner,
            overflowMenu,
            threeDotsMenuPosition,
        ],
    );

    const xeroConnectionMenuItems: MenuItemProps[] = useMemo(
        () => [
            !xeroConnection
                ? {
                      icon: Expensicons.XeroSquare,
                      iconType: 'avatar',
                      interactive: false,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      shouldShowRightComponent: true,
                      title: translate('workspace.accounting.qbo'),
                      rightComponent: (
                          <ConnectToXeroButton
                              policyID={policyID}
                              environmentURL={environmentURL}
                          />
                      ),
                  }
                : {
                      icon: Expensicons.XeroSquare,
                      iconType: 'avatar',
                      interactive: false,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      shouldShowRightComponent: true,
                      title: translate('workspace.accounting.qbo'),
                      description: xeroSyncInProgress
                          ? translate('workspace.accounting.connections.syncStageName', xeroConnection.stageInProgress)
                          : translate('workspace.accounting.lastSync'),
                      rightComponent: xeroSyncInProgress ? (
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
            ...(xeroConnection
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
        ],
        [
            xeroConnection,
            xeroSyncInProgress,
            styles.sectionMenuItemTopDescription,
            styles.popoverMenuIcon,
            translate,
            policyID,
            environmentURL,
            theme.spinner,
            overflowMenu,
            threeDotsMenuPosition,
        ],
    );

    const connectionsMenuItems: MenuItemProps[] = useMemo(() => [...qboConnectionMenuItems, ...xeroConnectionMenuItems], [qboConnectionMenuItems, xeroConnectionMenuItems]);

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

export default withPolicy(WorkspaceAccountingPage);
