import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

type WorkspaceMenuItem = {
    translationKey?: TranslationPaths;
    descriptionTranslationKey?: TranslationPaths;
    icon?: IconAsset;
    iconRight?: IconAsset;
    iconHeight?: number;
    iconWidth?: number;
    interactive?: boolean;
    disabled?: boolean;
    onButtonPress?: () => void;
};

function PolicyAccountingPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [shouldSetupQBO, setShouldSetupQBO] = useState<boolean>(false);
    const threeDotsMenuContainerRef = useRef<View>(null);

    const shouldShowQBIConnectionOptionsMenuItems = true;

    const connectionIconSize = useMemo(() => ({iconHeight: variables.avatarSizeNormal, iconWidth: variables.avatarSizeNormal}), []);
    const connectionsMenuItems: WorkspaceMenuItem[] = useMemo(
        () => [
            {
                translationKey: 'workspace.accounting.qbo',
                icon: Expensicons.QBORound,
                interactive: false,
                onButtonPress: () => setShouldSetupQBO(true),
                ...connectionIconSize,
            },
            {
                translationKey: 'workspace.accounting.xero',
                icon: Expensicons.XeroRound,
                interactive: false,
                disabled: true,
                onButtonPress: () => {},
                ...connectionIconSize,
            },
        ],
        [setShouldSetupQBO, connectionIconSize],
    );

    const qboConnectionOptionsMenuItems: WorkspaceMenuItem[] = useMemo(
        () => [
            {
                translationKey: 'workspace.accounting.import',
                icon: Expensicons.Pencil,
                iconRight: Expensicons.ArrowRight,
            },
            {
                translationKey: 'workspace.accounting.export',
                icon: Expensicons.Send,
                iconRight: Expensicons.ArrowRight,
            },
            {
                translationKey: 'workspace.accounting.advanced',
                icon: Expensicons.Gear,
                iconRight: Expensicons.ArrowRight,
            },
        ],
        [],
    );

    const qboConnectionMenuItems: WorkspaceMenuItem[] = useMemo(
        () => [
            ...(shouldShowQBIConnectionOptionsMenuItems ? qboConnectionOptionsMenuItems : []),
            {
                descriptionTranslationKey: 'workspace.accounting.other',
                iconRight: Expensicons.DownArrow,
            },
        ],
        [shouldShowQBIConnectionOptionsMenuItems, qboConnectionOptionsMenuItems],
    );

    const menuItems = useMemo(() => {
        const baseMenuItems = [...(!shouldSetupQBO ? connectionsMenuItems : []), ...(shouldSetupQBO ? qboConnectionMenuItems : [])];

        return baseMenuItems.map((item) => ({
            key: item.translationKey ?? item.descriptionTranslationKey,
            title: item.translationKey && translate(item.translationKey as TranslationPaths),
            description: item.descriptionTranslationKey && translate(item.descriptionTranslationKey as TranslationPaths),
            icon: item.icon,
            iconRight: item.iconRight,
            shouldShowRightIcon: !!item.iconRight,
            interactive: item.interactive,
            shouldShowRightComponent: !item.iconRight,
            iconHeight: item.iconHeight,
            iconWidth: item.iconWidth,
            disabled: item.disabled,
            rightComponent: (
                <Button
                    onPress={item.onButtonPress}
                    style={[styles.pl2]}
                    text={translate('workspace.accounting.setup')}
                    small
                    isDisabled={item.disabled}
                />
            ),
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [translate, styles, shouldSetupQBO, connectionsMenuItems, qboConnectionMenuItems]);

    const threeDotsMenuItems = [
        {
            icon: Expensicons.Sync,
            text: translate('workspace.accounting.syncNow'),
            onSelected: () => {},
        },
        {
            icon: Expensicons.Trashcan,
            text: translate('workspace.accounting.disconnect'),
            onSelected: () => {},
        },
    ];

    return (
        <ScreenWrapper
            testID={PolicyAccountingPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.accounting')}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack()}
                icon={Illustrations.Accounting}
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
                        {shouldSetupQBO && (
                            <View
                                ref={threeDotsMenuContainerRef}
                                style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}
                            >
                                <MenuItem
                                    title={translate('workspace.accounting.qbo')}
                                    description={translate('workspace.accounting.lastSync')}
                                    icon={Expensicons.QBORound}
                                    iconHeight={variables.avatarSizeNormal}
                                    iconWidth={variables.avatarSizeNormal}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    interactive={false}
                                />
                                <ThreeDotsMenu
                                    onIconPress={() => {
                                        threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                                            setThreeDotsMenuPosition({
                                                horizontal: x + width,
                                                vertical: y + height,
                                            });
                                        });
                                    }}
                                    menuItems={threeDotsMenuItems}
                                    anchorPosition={threeDotsMenuPosition}
                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                    shouldOverlay
                                />
                            </View>
                        )}
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default PolicyAccountingPage;
