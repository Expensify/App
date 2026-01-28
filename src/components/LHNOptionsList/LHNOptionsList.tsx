/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {useIsFocused, useRoute} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {BlockingViewProps} from '@components/BlockingViews/BlockingView';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import TextBlock from '@components/TextBlock';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getCachedLastMessageText, getCachedReportActionsForDisplay, getIOUReportIDOfLastAction, getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getSortedReportActions,
    getSortedReportActionsForDisplay,
    isInviteOrRemovedAction,
    isMoneyRequestAction,
    shouldReportActionBeVisibleAsLastAction,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionUtil} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import OptionRowLHNData from './OptionRowLHNData';
import OptionRowRendererComponent from './OptionRowRendererComponent';
import type {LHNOptionsListProps, RenderItemProps} from './types';
import useEmptyLHNIllustration from './useEmptyLHNIllustration';

const keyExtractor = (item: Report) => `report_${item.reportID}`;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions = false, onFirstItemRendered = () => {}}: LHNOptionsListProps) {
    const componentRenderCount = useRef(0);
    const renderItemCountByReportID = useRef<Record<string, number>>({});
    const previousExtraDataRef = useRef<string>('');
    
    componentRenderCount.current += 1;
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const flashListRef = useRef<FlashListRef<Report>>(null);
    const route = useRoute();
    const isScreenFocused = useIsFocused();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [reportMetadataCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {canBeMissing: true});
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: false});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const [isFullscreenVisible] = useOnyx(ONYXKEYS.FULLSCREEN_VISIBILITY, {canBeMissing: true});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, preferredLocale, localeCompare} = useLocalize();
    const isReportsSplitNavigatorLast = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    const shouldShowEmptyLHN = data.length === 0;
    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const emptyLHNIllustration = useEmptyLHNIllustration();

    const renderStatsRef = useRef({
        renderItemCallCount: 0,
        getSortedReportActionsForDisplayTime: 0,
        getLastMessageTextForReportTime: 0,
        getSortedReportActionsTime: 0,
        shouldReportActionBeVisibleAsLastActionTime: 0,
        shouldReportActionBeVisibleAsLastActionCallCount: 0,
        totalRenderItemTime: 0,
    });

    const previousDataLength = usePrevious(data.length);
    const hasLoggedInitialStats = useRef(false);

    useEffect(() => {
        const totalReports = Object.keys(reports ?? {}).length;
        const totalReportActions = Object.keys(reportActions ?? {}).length;
        const reportsInLHN = data.length;

        if (reportsInLHN > 0 && !hasLoggedInitialStats.current) {
            hasLoggedInitialStats.current = true;

            Log.info('[LHN DEBUG] LHN loaded', false, {
                reportsInLHN,
                totalReports,
                totalReportActions,
                optionMode,
            });
        }
    }, [data.length, reports, reportActions, optionMode]);

    useEffect(() => {
        if (renderStatsRef.current.renderItemCallCount === 0) {
            return;
        }

        const stats = renderStatsRef.current;
        const callCount = stats.renderItemCallCount;
        const avgRenderItemTime = stats.totalRenderItemTime / callCount;
        const avgGetSortedTime = stats.getSortedReportActionsForDisplayTime / callCount;
        const avgGetLastMessageTime = stats.getLastMessageTextForReportTime / callCount;
        const avgGetSortedActionsTime = stats.getSortedReportActionsTime / callCount;
        const avgVisibilityCheckTime = stats.shouldReportActionBeVisibleAsLastActionTime / (stats.shouldReportActionBeVisibleAsLastActionCallCount || 1);

        const redundantRenders = Object.entries(renderItemCountByReportID.current).filter(([, count]) => count > 1);
        const maxRenderCount = Math.max(...Object.values(renderItemCountByReportID.current), 0);
        const topRedundantRenders = redundantRenders
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([reportID, count]) => ({reportID: reportID.substring(0, 8), count}));

        Log.info('[LHN DEBUG] Render Performance Summary', false, {
            componentRenderCount: componentRenderCount.current,
            renderItemCallCount: callCount,
            avgRenderItemTime: `${avgRenderItemTime.toFixed(2)}ms`,
            avgGetSortedReportActionsForDisplay: `${avgGetSortedTime.toFixed(2)}ms`,
            avgGetLastMessageTextForReport: `${avgGetLastMessageTime.toFixed(2)}ms`,
            avgGetSortedReportActions: `${avgGetSortedActionsTime.toFixed(2)}ms`,
            avgShouldReportActionBeVisibleAsLastAction: `${avgVisibilityCheckTime.toFixed(2)}ms`,
            visibilityCheckCallCount: stats.shouldReportActionBeVisibleAsLastActionCallCount,
            totalTime: `${stats.totalRenderItemTime.toFixed(2)}ms`,
            reportsInLHN: data.length,
            redundantRendersCount: redundantRenders.length,
            maxRenderCount,
            topRedundantRenders,
        });

        renderItemCountByReportID.current = {};

        renderStatsRef.current = {
            renderItemCallCount: 0,
            getSortedReportActionsForDisplayTime: 0,
            getLastMessageTextForReportTime: 0,
            getSortedReportActionsTime: 0,
            shouldReportActionBeVisibleAsLastActionTime: 0,
            shouldReportActionBeVisibleAsLastActionCallCount: 0,
            totalRenderItemTime: 0,
        };
    }, [data.length, previousDataLength]);

    const firstReportIDWithGBRorRBR = useMemo(() => {
        const firstReportWithGBRorRBR = data.find((report) => {
            const itemReportErrors = reportAttributes?.[report.reportID]?.reportErrors;
            if (!report) {
                return false;
            }
            if (!isEmptyObject(itemReportErrors)) {
                return true;
            }
            const hasGBR = reportAttributes?.[report.reportID]?.requiresAttention;
            return hasGBR;
        });

        return firstReportWithGBRorRBR?.reportID;
    }, [data, reportAttributes]);

    const hasCalledOnLayout = React.useRef(false);
    const onLayoutItem = useCallback(() => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;

        onFirstItemRendered();
    }, [onFirstItemRendered]);

    const triggerScrollEvent = useScrollEventEmitter();

    const emptyLHNSubtitle = useMemo(
        () => (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter]}>
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText1')}
                />
                <Icon
                    src={expensifyIcons.MagnifyingGlass}
                    width={variables.emptyLHNIconWidth}
                    height={variables.emptyLHNIconHeight}
                    fill={theme.icon}
                    small
                    additionalStyles={styles.mh1}
                />
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText2')}
                />
                <Icon
                    src={Expensicons.Plus}
                    width={variables.emptyLHNIconWidth}
                    height={variables.emptyLHNIconHeight}
                    fill={theme.icon}
                    small
                    additionalStyles={styles.mh1}
                />
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText3')}
                />
            </View>
        ),
        [
            styles.alignItemsCenter,
            styles.flexRow,
            styles.justifyContentCenter,
            styles.flexWrap,
            styles.textAlignCenter,
            styles.mh1,
            theme.icon,
            theme.textSupporting,
            styles.textNormal,
            translate,
            expensifyIcons.MagnifyingGlass,
        ],
    );

    const renderItem = useCallback(
        ({item, index}: RenderItemProps): ReactElement => {
            // const renderStartTime = performance.now();
            const reportID = item.reportID;
            // renderItemCountByReportID.current[reportID] = (renderItemCountByReportID.current[reportID] || 0) + 1;
            const itemParentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.parentReportID}`];
            const itemReportNameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.chatReportID}`];
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            const itemOneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getOneTransactionThreadReportID(item, chatReport, itemReportActions, isOffline)}`];
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${item?.parentReportID}`];
            const itemParentReportAction = item?.parentReportActionID ? itemParentReportActions?.[item?.parentReportActionID] : undefined;
            const itemReportAttributes = reportAttributes?.[reportID];

            let invoiceReceiverPolicyID = '-1';
            if (item?.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
                invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
            }
            if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
                invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
            }
            const itemInvoiceReceiverPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`];

            const iouReportIDOfLastAction = getIOUReportIDOfLastAction(item);
            const itemIouReportReportActions = iouReportIDOfLastAction ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDOfLastAction}`] : undefined;

            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${item?.policyID}`];
            const transactionID = isMoneyRequestAction(itemParentReportAction)
                ? (getOriginalMessage(itemParentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
                : CONST.DEFAULT_NUMBER_ID;
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            const hasDraftComment =
                !!draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] &&
                !draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`]?.match(CONST.REGEX.EMPTY_COMMENT);

            const isReportArchived = !!itemReportNameValuePairs?.private_isArchived;

            // const getSortedStartTime = performance.now();
            const sortedReportActionsForDisplay = getCachedReportActionsForDisplay(reportID);
            // const getSortedEndTime = performance.now();
            // const getSortedDuration = getSortedEndTime - getSortedStartTime;

            // renderStatsRef.current.getSortedReportActionsForDisplayTime += getSortedDuration;
            // renderStatsRef.current.renderItemCallCount += 1;

            const lastReportAction = sortedReportActionsForDisplay.at(0);

            const lastReportActionTransactionID = isMoneyRequestAction(lastReportAction)
                ? (getOriginalMessage(lastReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
                : CONST.DEFAULT_NUMBER_ID;
            const lastReportActionTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${lastReportActionTransactionID}`];

            let lastActorDetails: Partial<PersonalDetails> | null = item?.lastActorAccountID && personalDetails?.[item.lastActorAccountID] ? personalDetails[item.lastActorAccountID] : null;
            if (!lastActorDetails && lastReportAction) {
                const lastActorDisplayName = lastReportAction?.person?.[0]?.text;
                lastActorDetails = lastActorDisplayName
                    ? {
                          displayName: lastActorDisplayName,
                          accountID: item?.lastActorAccountID,
                      }
                    : null;
            }
            const movedFromReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
            const movedToReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
            const itemReportMetadata = reportMetadataCollection?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

            // const getLastMessageStartTime = performance.now();
            const lastMessageTextFromReport = getCachedLastMessageText(reportID, () =>
                getLastMessageTextForReport({
                    translate,
                    report: item,
                    lastActorDetails,
                    movedFromReport,
                    movedToReport,
                    policy: itemPolicy,
                    isReportArchived: !!itemReportNameValuePairs?.private_isArchived,
                    policyForMovingExpensesID,
                    reportMetadata: itemReportMetadata,
                    currentUserAccountID,
                }),
            );
            // const getLastMessageEndTime = performance.now();
            // const getLastMessageDuration = getLastMessageEndTime - getLastMessageStartTime;

            // renderStatsRef.current.getLastMessageTextForReportTime += getLastMessageDuration;

            const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

            let lastAction: ReportAction | undefined;
            // const getSortedActionsDuration = 0;
            if (!itemReportActions || !item) {
                lastAction = undefined;
            } else {
                lastAction = sortedReportActionsForDisplay.at(-1);
            }

            let lastActionReport: OnyxEntry<Report> | undefined;
            if (isInviteOrRemovedAction(lastAction)) {
                const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
                lastActionReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage?.reportID}`];
            }

            // const renderEndTime = performance.now();
            // const renderDuration = renderEndTime - renderStartTime;
            // renderStatsRef.current.totalRenderItemTime += renderDuration;

            // const renderCount = renderItemCountByReportID.current[reportID];
            // if (renderDuration > 5 || renderStatsRef.current.renderItemCallCount <= 5 || renderCount > 1) {
            //     const actionCount = Object.keys(itemReportActions ?? {}).length;
            //     Log.info('[LHN DEBUG] renderItem Performance', false, {
            //         reportID,
            //         index,
            //         renderCount,
            //         renderDuration: `${renderDuration.toFixed(2)}ms`,
            //         getSortedReportActionsForDisplay: `${getSortedDuration.toFixed(2)}ms`,
            //         getLastMessageTextForReport: `${getLastMessageDuration.toFixed(2)}ms`,
            //         getSortedReportActions: `${getSortedActionsDuration.toFixed(2)}ms`,
            //         actionCount,
            //         isArchived: isReportArchived,
            //     });
            // }

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={item}
                    reportAttributes={itemReportAttributes}
                    oneTransactionThreadReport={itemOneTransactionThreadReport}
                    reportNameValuePairs={itemReportNameValuePairs}
                    reportActions={itemReportActions}
                    parentReportAction={itemParentReportAction}
                    iouReportReportActions={itemIouReportReportActions}
                    policy={itemPolicy}
                    invoiceReceiverPolicy={itemInvoiceReceiverPolicy}
                    personalDetails={personalDetails ?? {}}
                    transaction={itemTransaction}
                    lastReportActionTransaction={lastReportActionTransaction}
                    receiptTransactions={transactions}
                    viewMode={optionMode}
                    isOptionFocused={!shouldDisableFocusOptions}
                    lastMessageTextFromReport={lastMessageTextFromReport}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    hasDraftComment={hasDraftComment}
                    transactionViolations={transactionViolations}
                    onLayout={onLayoutItem}
                    shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip}
                    activePolicyID={activePolicyID}
                    onboardingPurpose={introSelected?.choice}
                    onboarding={onboarding}
                    isFullscreenVisible={isFullscreenVisible}
                    isReportsSplitNavigatorLast={isReportsSplitNavigatorLast}
                    isScreenFocused={isScreenFocused}
                    localeCompare={localeCompare}
                    translate={translate}
                    testID={index}
                    isReportArchived={isReportArchived}
                    lastAction={lastAction}
                    lastActionReport={lastActionReport}
                    currentUserAccountID={currentUserAccountID}
                />
            );
        },
        [
            reports,
            reportNameValuePairs,
            reportActions,
            reportMetadataCollection,
            isOffline,
            reportAttributes,
            policy,
            transactions,
            draftComments,
            personalDetails,
            policyForMovingExpensesID,
            firstReportIDWithGBRorRBR,
            optionMode,
            shouldDisableFocusOptions,
            onSelectRow,
            preferredLocale,
            transactionViolations,
            onLayoutItem,
            activePolicyID,
            introSelected?.choice,
            onboarding,
            isFullscreenVisible,
            isReportsSplitNavigatorLast,
            isScreenFocused,
            localeCompare,
            translate,
            currentUserAccountID,
        ],
    );

    const extraData = useMemo(
        () => {
            const newExtraData = [
                reportActions,
                reports,
                reportAttributes,
                reportNameValuePairs,
                transactionViolations,
                policy,
                personalDetails,
                data.length,
                draftComments,
                optionMode,
                preferredLocale,
                transactions,
                isOffline,
                isScreenFocused,
                isReportsSplitNavigatorLast,
            ];
            const extraDataKeys = ['reportActions', 'reports', 'reportAttributes', 'reportNameValuePairs', 'transactionViolations', 'policy', 'personalDetails', 'data.length', 'draftComments', 'optionMode', 'preferredLocale', 'transactions', 'isOffline', 'isScreenFocused', 'isReportsSplitNavigatorLast'];
            const extraDataValues = newExtraData.map((item) => {
                if (typeof item === 'object' && item !== null) {
                    return Object.keys(item).length;
                }
                return item;
            });
            const extraDataString = JSON.stringify(extraDataValues);
            
            if (previousExtraDataRef.current && previousExtraDataRef.current !== extraDataString) {
                const previousValues = JSON.parse(previousExtraDataRef.current);
                const changedKeys = extraDataKeys.filter((_, index) => previousValues[index] !== extraDataValues[index]);
                const changes = changedKeys.map((key, idx) => {
                    const keyIndex = extraDataKeys.indexOf(key);
                    return {
                        key,
                        from: previousValues[keyIndex],
                        to: extraDataValues[keyIndex],
                    };
                });
                
                Log.info('[LHN DEBUG] extraData changed', false, {
                    componentRenderCount: componentRenderCount.current,
                    changes,
                });
            }
            previousExtraDataRef.current = extraDataString;
            return newExtraData;
        },
        [
            reportActions,
            reports,
            reportAttributes,
            reportNameValuePairs,
            transactionViolations,
            policy,
            personalDetails,
            data.length,
            draftComments,
            optionMode,
            preferredLocale,
            transactions,
            isOffline,
            isScreenFocused,
            isReportsSplitNavigatorLast,
        ],
    );

    const previousOptionMode = usePrevious(optionMode);

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }

        if (!flashListRef.current) {
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
        [estimatedItemSize, isWeb, route, saveScrollIndex, saveScrollOffset, triggerScrollEvent],
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
    }, [getScrollOffset, route, isWeb]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldShowEmptyLHN) {
            Log.info('Woohoo! All caught up. Was rendered', false, {
                reportsCount: Object.keys(reports ?? {}).length,
                reportActionsCount: Object.keys(reportActions ?? {}).length,
                policyCount: Object.keys(policy ?? {}).length,
                personalDetailsCount: Object.keys(personalDetails ?? {}).length,
                route,
                reportsIDsFromUseReportsCount: data.length,
            });
        }
    }, [data.length, shouldShowEmptyLHN, route, reports, reportActions, policy, personalDetails]);

    return (
        <View style={[style ?? styles.flex1, shouldShowEmptyLHN ? styles.emptyLHNWrapper : undefined]}>
            {shouldShowEmptyLHN ? (
                <BlockingView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(emptyLHNIllustration as BlockingViewProps)}
                    title={translate('common.emptyLHN.title')}
                    CustomSubtitle={emptyLHNSubtitle}
                    accessibilityLabel={translate('common.emptyLHN.title')}
                />
            ) : (
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
                    drawDistance={1000}
                    removeClippedSubviews
                />
            )}
        </View>
    );
}

export default memo(LHNOptionsList);
