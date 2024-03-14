import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import IconAsset from '@src/types/utils/IconAsset';

type WorkspaceMenuItem = {
    translationKey?: TranslationPaths;
    descriptionTranslationKey?: TranslationPaths;
    icon?: IconAsset;
    iconRight?: IconAsset;
    iconHeight?: number;
    iconWidth?: number;
};

function PolicyAccountingPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {isSmallScreenWidth} = useWindowDimensions();

    const shouldSetupQBO = true;

    const connectionIconSize = {iconHeight: variables.avatarSizeNormal, iconWidth: variables.avatarSizeNormal};
    const connectionsMenuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.accounting.qbo',
            icon: Expensicons.QBORound,
            ...connectionIconSize,
        },
        {
            translationKey: 'workspace.accounting.xero',
            icon: Expensicons.XeroRound,
            ...connectionIconSize,
        },
    ];

    const qboConnectionMenuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.accounting.qbo',
            descriptionTranslationKey: 'workspace.accounting.lastSync',
            icon: Expensicons.QBORound,
            iconRight: Expensicons.ThreeDots,
            ...connectionIconSize,
        },
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
        {
            descriptionTranslationKey: 'workspace.accounting.other',
            iconRight: Expensicons.DownArrow,
        },
    ];

    const menuItems = useMemo(() => {
        const baseMenuItems = [...(!shouldSetupQBO ? connectionsMenuItems : []), ...(shouldSetupQBO ? qboConnectionMenuItems : [])];

        return baseMenuItems.map((item) => ({
            key: item.translationKey || item.descriptionTranslationKey,
            title: item.translationKey && translate(item.translationKey as TranslationPaths),
            description: item?.descriptionTranslationKey && translate(item?.descriptionTranslationKey as TranslationPaths),
            icon: item.icon,
            iconRight: item.iconRight,
            shouldShowRightIcon: !!item.iconRight,
            interactive: false,
            shouldShowRightComponent: !item.iconRight,
            iconHeight: item.iconHeight,
            iconWidth: item.iconWidth,
            rightComponent: (
                <Button
                    onPress={() => {}}
                    style={[styles.pl2]}
                    text={translate('workspace.accounting.setup')}
                    small
                />
            ),
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [translate, styles]);

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
