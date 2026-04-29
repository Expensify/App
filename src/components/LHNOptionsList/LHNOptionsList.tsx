/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {useRoute} from '@react-navigation/native';
import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
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
import LHNTooltipContextProvider from './LHNTooltipContextProvider';
import OptionRowLHNData from './OptionRowLHNData';
import OptionRowRendererComponent from './OptionRowRendererComponent';
import type {LHNOptionsListProps, RenderItemProps} from './types';

const keyExtractor = (item: Report) => `report_${item.reportID}`;
const platform = getPlatform();
const isWeb = platform === CONST.PLATFORM.WEB;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions = false, onFirstItemRendered = () => {}}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const flashListRef = useRef<FlashListRef<Report>>(null);
    const route = useRoute();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const reportAttributes = useReportAttributes();
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

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
        ({item, index}: RenderItemProps): ReactElement => {
            const reportID = item.reportID;
            const itemReportAttributes = reportAttributes?.[reportID];
            const itemParentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.parentReportID}`];
            const itemOneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${itemReportAttributes?.oneTransactionThreadReportID}`];

            let invoiceReceiverPolicyID = '-1';
            if (item?.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
                invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
            }
            if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
                invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
            }
            const itemInvoiceReceiverPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`];
            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${item?.policyID}`];

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
                    conciergeReportID={conciergeReportID}
                    viewMode={optionMode}
                    isOptionFocused={!shouldDisableFocusOptions}
                    onSelectRow={onSelectRow}
                    onLayout={onLayoutItem}
                    testID={index}
                />
            );
        },
        [reportAttributes, reports, policy, personalDetails, conciergeReportID, optionMode, shouldDisableFocusOptions, onSelectRow, onLayoutItem],
    );

    const extraData = useMemo(
        () => [reports, reportAttributes, policy, personalDetails, conciergeReportID, data.length, optionMode, isOffline],
        [reports, reportAttributes, policy, personalDetails, conciergeReportID, data.length, optionMode, isOffline],
    );

    const previousOptionMode = usePrevious(optionMode);

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }

        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        flashListRef.current.scrollToOffset({offset: 0});
    }, [previousOptionMode, optionMode]);

    const onScroll = useCallback<NonNullable<FlashListProps<string>['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
            if (isWeb) {
                saveScrollIndex(route, Math.floor(e.nativeEvent.contentOffset.y / estimatedItemSize));
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
                    initialScrollIndex={isWeb ? getScrollIndex(route) : undefined}
                    maintainVisibleContentPosition={{disabled: true}}
                    drawDistance={250}
                    removeClippedSubviews
                />
            </LHNTooltipContextProvider>
        </View>
    );
}

export default memo(LHNOptionsList);
