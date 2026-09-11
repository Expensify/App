import setLegendListItemZIndex from '@components/LegendList/setLegendListItemZIndex';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {LegendListProps, LegendListRef} from '@legendapp/list/react-native';
import type {ReactElement} from 'react';

import {LegendList} from '@legendapp/list/react-native';
import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import type {LHNOptionsListProps, RenderItemProps} from './types';

import LHNTooltipContextProvider from './LHNTooltipContextProvider';
import OptionRowLHNData from './OptionRowLHN';

const keyExtractor = (item: Report) => `report_${item.reportID}`;
const platform = getPlatform();
const isWeb = platform === CONST.PLATFORM.WEB;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions = false, onFirstItemRendered = () => {}}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const legendListRef = useRef<LegendListRef>(null);
    const route = useRoute();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const reportAttributes = useReportAttributes();
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const styles = useThemeStyles();
    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;

    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    const hasCalledOnLayout = React.useRef(false);
    const onLayoutItem = () => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;
        onFirstItemRendered();
    };

    const updateItemZIndex = (index: number) => {
        if (isWeb) {
            return;
        }

        setLegendListItemZIndex(legendListRef.current, index, -index);
    };

    const updateMountedItemZIndices = () => {
        if (isWeb || !legendListRef.current) {
            return;
        }

        const state = legendListRef.current.getState();
        const startIndex = Math.max(0, state.startBuffered);
        const endIndex = Math.min(state.data.length - 1, state.endBuffered);
        if (!Number.isFinite(startIndex) || !Number.isFinite(endIndex) || endIndex < startIndex) {
            return;
        }

        for (let index = startIndex; index <= endIndex; index++) {
            updateItemZIndex(index);
        }
    };

    const handleItemLayout = (index: number) => {
        onLayoutItem();
        updateItemZIndex(index);
    };

    const onViewableItemsChanged: NonNullable<LegendListProps<Report>['onViewableItemsChanged']> = ({viewableItems}) => {
        for (const item of viewableItems) {
            updateItemZIndex(item.index);
        }
    };

    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();

    /**
     * Function which renders a row in the list
     */
    const renderItem = ({item, index}: RenderItemProps): ReactElement | null => {
        if (!item) {
            return null;
        }
        const reportID = item.reportID;
        const itemReportAttributes = reportAttributes?.[reportID];
        const itemParentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.parentReportID}`];
        const itemOneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${itemReportAttributes?.oneTransactionThreadReportID}`];

        let invoiceReceiverPolicyID = '-1';
        if (item.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
            invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
        }
        if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
            invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
        }
        const itemInvoiceReceiverPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`];
        const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];

        return (
            <OptionRowLHNData
                reportID={reportID}
                fullReport={item}
                reportAttributes={itemReportAttributes}
                reportAttributesDerived={reportAttributes}
                oneTransactionThreadReport={itemOneTransactionThreadReport}
                policy={itemPolicy}
                invoiceReceiverPolicy={itemInvoiceReceiverPolicy}
                personalDetails={personalDetails ?? {}}
                viewMode={optionMode}
                isOptionFocused={!shouldDisableFocusOptions}
                onSelectRow={onSelectRow}
                onLayout={() => handleItemLayout(index)}
                testID={index}
            />
        );
    };

    const extraData = [reports, reportAttributes, policy, personalDetails, data.length, optionMode, isOffline, renderItem];

    const previousOptionMode = usePrevious(optionMode);

    useEffect(() => {
        if (isWeb) {
            return;
        }

        const animationFrame = requestAnimationFrame(updateMountedItemZIndices);
        return () => cancelAnimationFrame(animationFrame);
    }, [data, updateMountedItemZIndices]);

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !legendListRef.current) {
            return;
        }

        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        legendListRef.current.scrollToOffset({offset: 0});
    }, [previousOptionMode, optionMode]);

    const onScroll: NonNullable<LegendListProps<string>['onScroll']> = (e) => {
        // If the layout measurement is 0, it means the LegendList is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        if (isWeb) {
            saveScrollIndex(route, Math.floor(e.nativeEvent.contentOffset.y / estimatedItemSize));
        }
        triggerScrollEvent();
    };

    const onLayout = () => {
        const offset = getScrollOffset(route);

        if (!(offset && legendListRef.current) || isWeb) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && legendListRef.current)) {
                return;
            }
            legendListRef.current.scrollToOffset({offset});
        });
    };

    const savedScrollIndex = getScrollIndex(route);
    const initialScrollIndex = isWeb && savedScrollIndex !== undefined && savedScrollIndex >= 0 && savedScrollIndex < data.length ? savedScrollIndex : undefined;

    return (
        <View style={style ?? styles.flex1}>
            <LHNTooltipContextProvider data={data}>
                <LegendList
                    ref={legendListRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                    data={data}
                    testID="lhn-options-list"
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    extraData={extraData}
                    showsVerticalScrollIndicator={false}
                    onLayout={onLayout}
                    onLoad={updateMountedItemZIndices}
                    onScroll={onScroll}
                    onViewableItemsChanged={onViewableItemsChanged}
                    initialScrollIndex={initialScrollIndex}
                    maintainVisibleContentPosition={false}
                    drawDistance={250}
                    estimatedItemSize={estimatedItemSize}
                />
            </LHNTooltipContextProvider>
        </View>
    );
}

export default LHNOptionsList;
