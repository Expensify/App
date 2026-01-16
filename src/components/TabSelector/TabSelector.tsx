import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import {TabActions} from '@react-navigation/native';
import React, {useMemo} from 'react';
import type {TupleToUnion} from 'type-fest';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import TabSelectorBase from './TabSelectorBase';
import type {TabSelectorBaseItem} from './TabSelectorBase';

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

const MEMOIZED_LAZY_TAB_SELECTOR_ICONS = [
    'CalendarSolid',
    'UploadAlt',
    'User',
    'Car',
    'Hashtag',
    'Map',
    'Pencil',
    'ReceiptScan',
    'Receipt',
    'MoneyCircle',
    'Percent',
    'Crosshair',
    'Meter',
    'Clock',
] as const;

function getIconTitleAndTestID(
    icons: Record<TupleToUnion<typeof MEMOIZED_LAZY_TAB_SELECTOR_ICONS>, IconAsset>,
    route: string,
    translate: LocaleContextProps['translate'],
): IconTitleAndTestID {
    switch (route) {
        case CONST.TAB.RECEIPT_PARTNERS.ALL:
            return {title: translate('workspace.receiptPartners.uber.all'), testID: 'all'};
        case CONST.TAB.RECEIPT_PARTNERS.LINKED:
            return {title: translate('workspace.receiptPartners.uber.linked'), testID: 'linked'};
        case CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING:
            return {title: translate('workspace.receiptPartners.uber.outstanding'), testID: 'outstanding'};
        case CONST.TAB_REQUEST.MANUAL:
            return {icon: icons.Pencil, title: translate('tabSelector.manual'), testID: 'manual'};
        case CONST.TAB_REQUEST.SCAN:
            return {icon: icons.ReceiptScan, title: translate('tabSelector.scan'), testID: 'scan'};
        case CONST.TAB.NEW_CHAT:
            return {icon: icons.User, title: translate('tabSelector.chat'), testID: 'chat'};
        case CONST.TAB.NEW_ROOM:
            return {icon: icons.Hashtag, title: translate('tabSelector.room'), testID: 'room'};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: icons.Car, title: translate('common.distance'), testID: 'distance'};
        case CONST.TAB.SHARE.SHARE:
            return {icon: icons.UploadAlt, title: translate('common.share'), testID: 'share'};
        case CONST.TAB.SHARE.SUBMIT:
            return {icon: icons.Receipt, title: translate('common.submit'), testID: 'submit'};
        case CONST.TAB_REQUEST.PER_DIEM:
            return {icon: icons.CalendarSolid, title: translate('common.perDiem'), testID: 'perDiem'};
        case CONST.TAB_REQUEST.DISTANCE_MAP:
            return {icon: icons.Map, title: translate('tabSelector.map'), testID: 'distanceMap'};
        case CONST.TAB_REQUEST.DISTANCE_MANUAL:
            return {icon: icons.Pencil, title: translate('tabSelector.manual'), testID: 'distanceManual'};
        case CONST.TAB_REQUEST.DISTANCE_GPS:
            return {icon: icons.Crosshair, title: translate('tabSelector.gps'), testID: 'distanceGPS'};
        case CONST.TAB_REQUEST.DISTANCE_ODOMETER:
            return {icon: icons.Meter, title: translate('tabSelector.odometer'), testID: 'distanceOdometer'};
        case CONST.TAB.SPLIT.AMOUNT:
            return {icon: icons.MoneyCircle, title: translate('iou.amount'), testID: 'split-amount'};
        case CONST.TAB.SPLIT.PERCENTAGE:
            return {icon: icons.Percent, title: translate('iou.percent'), testID: 'split-percentage'};
        case CONST.TAB.SPLIT.DATE:
            return {icon: icons.CalendarSolid, title: translate('iou.date'), testID: 'split-date'};
        case CONST.TAB_REQUEST.TIME:
            return {icon: icons.Clock, title: translate('iou.time'), testID: 'time'};
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
    const icons = useMemoizedLazyExpensifyIcons(MEMOIZED_LAZY_TAB_SELECTOR_ICONS);
    const {translate} = useLocalize();

    const tabs: TabSelectorBaseItem[] = useMemo(
        () =>
            state.routes.map((route) => {
                const {icon, title, testID} = getIconTitleAndTestID(icons, route.name, translate);
                return {
                    key: route.name,
                    icon,
                    title,
                    testID,
                };
            }),
        [icons, state.routes, translate],
    );

    const activeRouteName = state.routes[state.index]?.name ?? '';

    const handleTabPress = (tabKey: string) => {
        const route = state.routes.find((candidateRoute) => candidateRoute.name === tabKey);
        if (!route) {
            return;
        }

        const isActive = route.key === state.routes[state.index]?.key;
        if (isActive) {
            return;
        }

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
        <FocusTrapContainerElement onContainerElementChanged={onFocusTrapContainerElementChanged}>
            <TabSelectorBase
                tabs={tabs}
                activeTabKey={activeRouteName}
                onTabPress={handleTabPress}
                position={position}
                shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                renderProductTrainingTooltip={renderProductTrainingTooltip}
                equalWidth={equalWidth}
            />
        </FocusTrapContainerElement>
    );
}

export default TabSelector;

export type {TabSelectorProps};
