import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import {TabActions} from '@react-navigation/native';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useIsResizing from '@hooks/useIsResizing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import TabSelectorItem from './TabSelectorItem';

type TabSelectorProps = MaterialTopTabBarProps & {
    /* Callback fired when tab is pressed */
    onTabPress?: (name: string) => void;

    /** Callback to register focus trap container element */
    onFocusTrapContainerElementChanged?: (element: HTMLElement | null) => void;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;
};

type IconTitleAndTestID = {
    icon?: IconAsset;
    title: string;
    testID?: string;
};

function getIconTitleAndTestID(icons: Record<'CalendarSolid' | 'UploadAlt' | 'User', IconAsset>, route: string, translate: LocaleContextProps['translate']): IconTitleAndTestID {
    switch (route) {
        case CONST.TAB.RECEIPT_PARTNERS.ALL:
            return {title: translate('workspace.receiptPartners.uber.all'), testID: 'all'};
        case CONST.TAB.RECEIPT_PARTNERS.LINKED:
            return {title: translate('workspace.receiptPartners.uber.linked'), testID: 'linked'};
        case CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING:
            return {title: translate('workspace.receiptPartners.uber.outstanding'), testID: 'outstanding'};
        case CONST.TAB_REQUEST.MANUAL:
            return {icon: Expensicons.Pencil, title: translate('tabSelector.manual'), testID: 'manual'};
        case CONST.TAB_REQUEST.SCAN:
            return {icon: Expensicons.ReceiptScan, title: translate('tabSelector.scan'), testID: 'scan'};
        case CONST.TAB.NEW_CHAT:
            return {icon: icons.User, title: translate('tabSelector.chat'), testID: 'chat'};
        case CONST.TAB.NEW_ROOM:
            return {icon: Expensicons.Hashtag, title: translate('tabSelector.room'), testID: 'room'};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: Expensicons.Car, title: translate('common.distance'), testID: 'distance'};
        case CONST.TAB.SHARE.SHARE:
            return {icon: icons.UploadAlt, title: translate('common.share'), testID: 'share'};
        case CONST.TAB.SHARE.SUBMIT:
            return {icon: Expensicons.Receipt, title: translate('common.submit'), testID: 'submit'};
        case CONST.TAB_REQUEST.PER_DIEM:
            return {icon: icons.CalendarSolid, title: translate('common.perDiem'), testID: 'perDiem'};
        case CONST.TAB_REQUEST.DISTANCE_MAP:
            return {icon: Expensicons.Map, title: translate('tabSelector.map'), testID: 'distanceMap'};
        case CONST.TAB_REQUEST.DISTANCE_MANUAL:
            return {icon: Expensicons.Pencil, title: translate('tabSelector.manual'), testID: 'distanceManual'};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

function TabSelector({
    state,
    navigation,
    onTabPress = () => {},
    position,
    onFocusTrapContainerElementChanged,
    shouldShowLabelWhenInactive = true,
    shouldShowProductTrainingTooltip = false,
    renderProductTrainingTooltip,
    equalWidth = false,
}: TabSelectorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'UploadAlt', 'User'] as const);
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: state.routes.length}, (v, i) => i), [state.routes.length]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);
    const viewRef = useRef<View>(null);
    const [selectorWidth, setSelectorWidth] = React.useState(0);
    const [selectorX, setSelectorX] = React.useState(0);

    const isResizing = useIsResizing();

    useEffect(() => {
        // It is required to wait transition end to reset affectedAnimatedTabs because tabs style is still animating during transition.
        setTimeout(() => {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST.ANIMATED_TRANSITION);
    }, [defaultAffectedAnimatedTabs, state.index]);

    const measure = useCallback(() => {
        viewRef.current?.measureInWindow((x, _y, width) => {
            setSelectorX(x);
            setSelectorWidth(width);
        });
    }, [viewRef]);

    useLayoutEffect(() => {
        // measure location/width after animation completes
        setTimeout(() => {
            measure();
        }, CONST.TOOLTIP_ANIMATION_DURATION);
    }, [measure]);

    useEffect(() => {
        if (isResizing) {
            return;
        }
        // Re-measure when resizing ends
        // This is necessary to ensure the tooltip is positioned correctly after resizing
        measure();
    }, [measure, isResizing]);

    return (
        <FocusTrapContainerElement onContainerElementChanged={onFocusTrapContainerElementChanged}>
            <View
                style={styles.tabSelector}
                ref={viewRef}
            >
                {state.routes.map((route, index) => {
                    const isActive = index === state.index;
                    const activeOpacity = getOpacity({routesLength: state.routes.length, tabIndex: index, active: true, affectedTabs: affectedAnimatedTabs, position, isActive});
                    const inactiveOpacity = getOpacity({routesLength: state.routes.length, tabIndex: index, active: false, affectedTabs: affectedAnimatedTabs, position, isActive});
                    const backgroundColor = getBackgroundColor({routesLength: state.routes.length, tabIndex: index, affectedTabs: affectedAnimatedTabs, theme, position, isActive});
                    const {icon, title, testID} = getIconTitleAndTestID(icons, route.name, translate);
                    const onPress = () => {
                        if (isActive) {
                            return;
                        }

                        setAffectedAnimatedTabs([state.index, index]);

                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!event.defaultPrevented) {
                            navigation.dispatch(TabActions.jumpTo(route.name));
                        }

                        onTabPress(route.name);
                    };

                    return (
                        <TabSelectorItem
                            key={route.name}
                            icon={icon}
                            title={title}
                            onPress={onPress}
                            activeOpacity={activeOpacity}
                            inactiveOpacity={inactiveOpacity}
                            backgroundColor={backgroundColor}
                            isActive={isActive}
                            testID={testID}
                            shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                            shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                            renderProductTrainingTooltip={renderProductTrainingTooltip}
                            parentWidth={selectorWidth}
                            parentX={selectorX}
                            equalWidth={equalWidth}
                        />
                    );
                })}
            </View>
        </FocusTrapContainerElement>
    );
}

TabSelector.displayName = 'TabSelector';

export default TabSelector;

export type {TabSelectorProps};
