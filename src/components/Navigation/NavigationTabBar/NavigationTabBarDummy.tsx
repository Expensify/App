import React, {memo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FloatingActionButton from '@components/FloatingActionButton';
import HeaderGap from '@components/HeaderGap';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import NavigationTabBarAvatar from '@pages/home/sidebar/NavigationTabBarAvatar';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATION_TABS from './NAVIGATION_TABS';

const noop = () => undefined;

function NavigationTabBarWideDummy({selectedTab}: {selectedTab: ValueOf<typeof NAVIGATION_TABS>}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;

    return (
        <View style={styles.leftNavigationTabBarContainer}>
            <HeaderGap />
            <View style={styles.flex1}>
                <PressableWithFeedback
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel="Home"
                    accessible={false}
                    testID="ExpensifyLogoButton"
                    onPress={noop}
                    wrapperStyle={styles.leftNavigationTabBarItem}
                >
                    <ImageSVG
                        style={StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT)}
                        src={Expensicons.ExpensifyAppIcon}
                    />
                </PressableWithFeedback>
                <EducationalTooltip
                    shouldRender={false}
                    anchorAlignment={{
                        horizontal: isWebOrDesktop ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    shiftHorizontal={isWebOrDesktop ? 0 : variables.navigationTabBarInboxTooltipShiftHorizontal}
                    renderTooltipContent={noop}
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                    shouldHideOnNavigate={false}
                    onTooltipPress={noop}
                >
                    <PressableWithFeedback
                        onPress={noop}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.inbox')}
                        style={styles.leftNavigationTabBarItem}
                    >
                        <View>
                            <Icon
                                src={Expensicons.Inbox}
                                fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                                width={variables.iconBottomBar}
                                height={variables.iconBottomBar}
                            />
                        </View>
                        <Text
                            style={[
                                styles.textSmall,
                                styles.textAlignCenter,
                                styles.mt1Half,
                                selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                                styles.navigationTabBarLabel,
                            ]}
                        >
                            {translate('common.inbox')}
                        </Text>
                    </PressableWithFeedback>
                </EducationalTooltip>
                <PressableWithFeedback
                    onPress={noop}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.reports')}
                    style={styles.leftNavigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.MoneySearch}
                            fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.reports')}
                    </Text>
                </PressableWithFeedback>
                <PressableWithFeedback
                    onPress={noop}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.workspacesTabTitle')}
                    style={styles.leftNavigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.Buildings}
                            fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.workspacesTabTitle')}
                    </Text>
                </PressableWithFeedback>
                <NavigationTabBarAvatar
                    style={styles.leftNavigationTabBarItem}
                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                    onPress={noop}
                />
            </View>
            <View style={styles.leftNavigationTabBarItem}>
                <FloatingActionButton
                    onPress={noop}
                    isActive={false}
                    accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                    role={CONST.ROLE.BUTTON}
                    isTooltipAllowed={false}
                />
            </View>
        </View>
    );
}

function NavigationTabBarNarrowDummy({selectedTab}: {selectedTab: ValueOf<typeof NAVIGATION_TABS>}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;

    return (
        <View style={styles.navigationTabBarContainer}>
            <EducationalTooltip
                shouldRender={false}
                anchorAlignment={{
                    horizontal: isWebOrDesktop ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                shiftHorizontal={isWebOrDesktop ? 0 : variables.navigationTabBarInboxTooltipShiftHorizontal}
                renderTooltipContent={noop}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                shouldHideOnNavigate={false}
                onTooltipPress={noop}
            >
                <PressableWithFeedback
                    onPress={noop}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.inbox')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.Inbox}
                            fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.inbox')}
                    </Text>
                </PressableWithFeedback>
            </EducationalTooltip>
            <PressableWithFeedback
                onPress={noop}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.reports')}
                wrapperStyle={styles.flex1}
                style={styles.navigationTabBarItem}
            >
                <View>
                    <Icon
                        src={Expensicons.MoneySearch}
                        fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                        width={variables.iconBottomBar}
                        height={variables.iconBottomBar}
                    />
                </View>
                <Text
                    style={[
                        styles.textSmall,
                        styles.textAlignCenter,
                        styles.mt1Half,
                        selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                        styles.navigationTabBarLabel,
                    ]}
                >
                    {translate('common.reports')}
                </Text>
            </PressableWithFeedback>
            <View style={[styles.flex1, styles.navigationTabBarItem]}>
                <FloatingActionButton
                    onPress={noop}
                    isActive={false}
                    accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                    role={CONST.ROLE.BUTTON}
                    isTooltipAllowed={false}
                />
            </View>
            <PressableWithFeedback
                onPress={noop}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.workspacesTabTitle')}
                wrapperStyle={styles.flex1}
                style={styles.navigationTabBarItem}
            >
                <View>
                    <Icon
                        src={Expensicons.Buildings}
                        fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                        width={variables.iconBottomBar}
                        height={variables.iconBottomBar}
                    />
                </View>
                <Text
                    style={[
                        styles.textSmall,
                        styles.textAlignCenter,
                        styles.mt1Half,
                        selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                        styles.navigationTabBarLabel,
                    ]}
                >
                    {translate('common.workspacesTabTitle')}
                </Text>
            </PressableWithFeedback>
            <NavigationTabBarAvatar
                style={styles.navigationTabBarItem}
                isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                onPress={noop}
            />
        </View>
    );
}

/**
 * This is a dummy component for the NavigationTabBar created for performance reasons.
 * It is used to render the dummy NavigationTabBar in a wide or narrow layout.
 * @param selectedTab - The selected tab.
 * @returns The NavigationTabBarDummy component.
 */
function NavigationTabBarDummy({selectedTab}: {selectedTab: ValueOf<typeof NAVIGATION_TABS>}) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (shouldUseNarrowLayout) {
        return <NavigationTabBarNarrowDummy selectedTab={selectedTab} />;
    }

    return <NavigationTabBarWideDummy selectedTab={selectedTab} />;
}

export default NavigationTabBarDummy;
