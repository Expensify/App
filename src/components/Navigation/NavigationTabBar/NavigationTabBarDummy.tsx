import React, {memo, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FloatingActionButton from '@components/FloatingActionButton';
import HeaderGap from '@components/HeaderGap';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import NavigationTabBarAvatar from '@pages/home/sidebar/NavigationTabBarAvatar';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import NAVIGATION_TABS from './NAVIGATION_TABS';

const noop = () => undefined;

function NavigationTabBarWideDummy({selectedTab}: {selectedTab: ValueOf<typeof NAVIGATION_TABS>}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);
    const {orderedReports} = useSidebarOrderedReports();
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (value) => value?.reports, canBeMissing: true});

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(orderedReports));
        // We need to get a new brick road state when report attributes are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportAttributes is added as a dependency here
    }, [orderedReports, reportAttributes]);

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
                        {!!chatTabBrickRoad && (
                            <View style={styles.navigationTabBarStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)} />
                        )}
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
                        {!!workspacesTabIndicatorStatus && <View style={styles.navigationTabBarStatusIndicator(workspacesTabIndicatorColor)} />}
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
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);
    const {orderedReports} = useSidebarOrderedReports();
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (value) => value?.reports, canBeMissing: true});

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(orderedReports));
        // We need to get a new brick road state when report attributes are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportAttributes is added as a dependency here
    }, [orderedReports, reportAttributes]);

    return (
        <View style={styles.navigationTabBarContainer}>
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
                    {!!chatTabBrickRoad && (
                        <View style={styles.navigationTabBarStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)} />
                    )}
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
                    {!!workspacesTabIndicatorStatus && <View style={styles.navigationTabBarStatusIndicator(workspacesTabIndicatorColor)} />}
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

export default memo(NavigationTabBarDummy);
