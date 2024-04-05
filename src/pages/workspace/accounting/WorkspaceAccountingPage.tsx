import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
// import ConnectToQuickbooksOnlineButton from './qboConnectionButton';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
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
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
// import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function WorkspaceAccountingPage({policy}: WithPolicyProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // const {environmentURL} = useEnvironment();
    // const waitForNavigate = useWaitForNavigation();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const {canUseAccountingIntegrations} = usePermissions();
    const hasAccess = PolicyUtils.isPolicyAdmin(policy) && policy?.areAccountingEnabled && policy?.areConnectionsEnabled && canUseAccountingIntegrations;

    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});

    // TODO
    const [policyIsConnectedToAccountingSystem, setPolicyIsConnectedToAccountingSystem] = useState(false);

    // TODO
    const [isSyncInProgress, setIsSyncInProgress] = useState(false);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);

    // const policyID = policy?.id ?? '';

    // TODO remove
    // fake a QBO connection sync
    const openQBOsync = useCallback(() => {
        setIsSyncInProgress(true);
        setTimeout(() => setIsSyncInProgress(false), 5000);
        setPolicyIsConnectedToAccountingSystem(true);
    }, []);

    const connectionsMenuItems: MenuItemProps[] = useMemo(
        () => [
            {
                icon: Expensicons.QBOSquare,
                iconType: 'avatar',
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                shouldShowRightComponent: true,
                title: translate('workspace.accounting.qbo'),
                rightComponent: (
                    // TODO use ConnectToQuickbooksOnlineButton instead
                    // <ConnectToQuickbooksOnlineButton
                    //     policyID={policyID}
                    //     environmentURL={environmentURL}
                    // />

                    <Button
                        onPress={openQBOsync}
                        text={translate('workspace.accounting.setup')}
                        style={styles.justifyContentCenter}
                        small
                    />
                ),
            },
        ],
        [styles.sectionMenuItemTopDescription, translate, openQBOsync, styles.justifyContentCenter],
    );

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
            {
                icon: Expensicons.QBOSquare,
                iconType: 'avatar',
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                shouldShowRightComponent: true,
                title: translate('workspace.accounting.qbo'),
                description: isSyncInProgress ? translate('workspace.accounting.connections.syncStageName', 'quickbooksOnlineImportCustomers') : translate('workspace.accounting.lastSync'),
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
            ...(isSyncInProgress
                ? []
                : [
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
                  ]),
        ],
        [translate, theme.spinner, isSyncInProgress, overflowMenu, threeDotsMenuPosition, styles.popoverMenuIcon, threeDotsMenuContainerRef, styles.sectionMenuItemTopDescription],
    );

    const otherConnectionMenuItems: MenuItemProps[] = useMemo(
        () => [
            {
                key: 'workspace.accounting.other',
                iconRight: Expensicons.DownArrow,
                shouldShowRightIcon: true,
                description: translate('workspace.accounting.other'),
                wrapperStyle: [styles.sectionMenuItemTopDescription, styles.mt3],
                onPress: () => {},
            },
        ],
        [styles.sectionMenuItemTopDescription, styles.mt3, translate],
    );

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
        <ScreenWrapper
            testID={WorkspaceAccountingPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                // TODO change back to !hasAccess
                shouldShow={hasAccess}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
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
                                menuItems={policyIsConnectedToAccountingSystem ? [...qboConnectionMenuItems, ...otherConnectionMenuItems] : connectionsMenuItems}
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceAccountingPage.displayName = 'WorkspaceAccountingPage';

export default withPolicy(WorkspaceAccountingPage);
