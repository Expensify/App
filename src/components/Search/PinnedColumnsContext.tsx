/** Which Spend columns are pinned left, and the sticky styles their cells get. */
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {createContext, useContext} from 'react';
import {View} from 'react-native';

import type {SearchColumnType} from './types';

import {getPinnedColumnStyle, getPinnedStartLineStyle, PINNED_CELL_CONTAINER_STYLE, PINNED_LEAD_STYLE} from './pinnedCellStyles';
import {PINNED_HEADING_DATA_SET} from './pinnedCellStyles/pinnedScrollVariables';
import {useIsListScrollingBothAxes} from './primitives/ListScrollAxesContext';

const NO_PINNED_COLUMNS: SearchColumnType[] = [];

const PinnedColumnsContext = createContext<SearchColumnType[]>(NO_PINNED_COLUMNS);

type PinnedColumnsProviderProps = React.PropsWithChildren<{
    /** The shown columns pinned to the table's start, in their order. */
    leftPinned: SearchColumnType[];
}>;

function PinnedColumnsProvider({leftPinned, children}: PinnedColumnsProviderProps) {
    return <PinnedColumnsContext.Provider value={leftPinned}>{children}</PinnedColumnsContext.Provider>;
}

function useLeftPinnedColumns(): SearchColumnType[] {
    return useContext(PinnedColumnsContext);
}

/** Pins stick to their nearest scroller, so they only hold inside a list that scrolls both ways. */
function useShouldHoldPins(): boolean {
    const leftPinned = useLeftPinnedColumns();
    const isListScrollingBothAxes = useIsListScrollingBothAxes();
    return leftPinned.length > 0 && isListScrollingBothAxes;
}

type PinnedColumnStyles = {
    getPinnedColumnStyle: (columnName: SearchColumnType) => ViewStyle | undefined;

    getPinnedHeadingDataSet: (columnName: SearchColumnType) => Record<string, string | undefined> | undefined;

    leadingStyle: ViewStyle | undefined;

    leadingLineStyle: ViewStyle | undefined;

    /** For every view between a row and its cells, so pinned cells can stack above the row's cover. */
    cellContainerStyle: ViewStyle | undefined;
};

function usePinnedColumnStyles(): PinnedColumnStyles {
    const styles = useThemeStyles();
    const leftPinned = useLeftPinnedColumns();
    const shouldHoldPins = useShouldHoldPins();

    const getPinnedColumnStyleByName = (columnName: SearchColumnType) => {
        const pinIndex = shouldHoldPins ? leftPinned.indexOf(columnName) : -1;
        return pinIndex === -1 ? undefined : getPinnedColumnStyle(pinIndex);
    };

    const getPinnedHeadingDataSet = (columnName: SearchColumnType) => (leftPinned.includes(columnName) ? PINNED_HEADING_DATA_SET : undefined);

    return {
        getPinnedColumnStyle: getPinnedColumnStyleByName,
        getPinnedHeadingDataSet,
        leadingStyle: shouldHoldPins ? PINNED_LEAD_STYLE : undefined,
        // Spend rows are padded by `ph3`, which the covers reach across.
        leadingLineStyle: shouldHoldPins ? getPinnedStartLineStyle(styles.ph3.paddingHorizontal) : undefined,
        cellContainerStyle: shouldHoldPins ? PINNED_CELL_CONTAINER_STYLE : undefined,
    };
}

type PinnedViewProps = React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
}>;

/**
 * A sticky box sticks only within its parent, and the checkbox's wrapper is only as big as the checkbox, so the pin goes on this View.
 */
function PinnedLeadingView({style, children}: PinnedViewProps) {
    const {leadingStyle} = usePinnedColumnStyles();

    if (!leadingStyle) {
        return children;
    }

    return <View style={[style, leadingStyle]}>{children}</View>;
}

/** Lets the pinned cells stack above the row's cover. */
function PinnedCellContainerView({style, children}: PinnedViewProps) {
    const {cellContainerStyle} = usePinnedColumnStyles();

    return <View style={[style, cellContainerStyle]}>{children}</View>;
}

export {PinnedColumnsProvider, PinnedLeadingView, PinnedCellContainerView, useLeftPinnedColumns, usePinnedColumnStyles, useShouldHoldPins};
