import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import {useRoute} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import type {LHNOptionsListProps, RenderItemProps} from './types';

import LHNTooltipContextProvider from './LHNTooltipContextProvider';
import OptionRowLHNData from './OptionRowLHN';
import OptionRowRendererComponent from './OptionRowRendererComponent';

const keyExtractor = (item: Report) => `report_${item.reportID}`;
const platform = getPlatform();
const isWeb = platform === CONST.PLATFORM.WEB;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    optionMode,
    shouldDisableFocusOptions = false,
    onFirstItemRendered = () => {},
    listHeaderComponent,
}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const flashListRef = useRef<FlashListRef<Report>>(null);
    const route = useRoute();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const reportAttributes = useReportAttributes();
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [personalDetails] = useAllPersonalDetails();

    const styles = useThemeStyles();
    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;

    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    const hasCalledOnLayout = React.useRef(false);
    const onLayoutItem = useCallback(() => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;
        onFirstItemRendered();
    }, [onFirstItemRendered]);

    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item, index}: RenderItemProps): ReactElement | null => {
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
                    onLayout={onLayoutItem}
                    testID={index}
                />
            );
        },
        [reportAttributes, reports, policy, personalDetails, optionMode, shouldDisableFocusOptions, onSelectRow, onLayoutItem],
    );

    const extraData = useMemo(
        () => [reports, reportAttributes, policy, personalDetails, data.length, optionMode, isOffline],
        [reports, reportAttributes, policy, personalDetails, data.length, optionMode, isOffline],
    );

    const previousOptionMode = usePrevious(optionMode);

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }

        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        flashListRef.current.scrollToOffset({offset: 0});
    }, [previousOptionMode, optionMode]);

    // Kept in a ref rather than state: onScroll is the only reader, and the header's height must never trigger a re-render.
    const listHeaderHeightRef = useRef(0);
    const onListHeaderLayout = useCallback((event: LayoutChangeEvent) => {
        listHeaderHeightRef.current = event.nativeEvent.layout.height;
    }, []);

    const onScroll = useCallback<NonNullable<FlashListProps<string>['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
            if (isWeb) {
                // The list header is part of the content, so discount its height before converting the offset to a
                // row index — otherwise the restored index overshoots by however many rows the header covers.
                const rowsOffset = Math.max(e.nativeEvent.contentOffset.y - listHeaderHeightRef.current, 0);
                saveScrollIndex(route, Math.floor(rowsOffset / estimatedItemSize));
            }
            triggerScrollEvent();
        },
        [estimatedItemSize, route, saveScrollIndex, saveScrollOffset, triggerScrollEvent],
    );

    const onLayout = useCallback(() => {
        const offset = getScrollOffset(route);

        if (!(offset && flashListRef.current) || isWeb) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({offset});
        });
    }, [getScrollOffset, route]);

    const savedScrollIndex = getScrollIndex(route);
    const initialScrollIndex = isWeb && savedScrollIndex !== undefined && savedScrollIndex >= 0 && savedScrollIndex < data.length ? savedScrollIndex : undefined;

    const listHeader = listHeaderComponent ? <View onLayout={onListHeaderLayout}>{listHeaderComponent}</View> : undefined;

    return (
        <View style={style ?? styles.flex1}>
            <LHNTooltipContextProvider data={data}>
                <FlashList
                    ref={flashListRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    CellRendererComponent={OptionRowRendererComponent}
                    contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                    data={data}
                    testID="lhn-options-list"
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    extraData={extraData}
                    showsVerticalScrollIndicator={false}
                    onLayout={onLayout}
                    onScroll={onScroll}
                    initialScrollIndex={initialScrollIndex}
                    ListHeaderComponent={listHeader}
                    maintainVisibleContentPosition={{disabled: true}}
                    drawDistance={250}
                    removeClippedSubviews
                />
            </LHNTooltipContextProvider>
        </View>
    );
}

export default memo(LHNOptionsList);
