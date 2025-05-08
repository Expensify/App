import {useRoute} from '@react-navigation/native';
import type {FlashListProps} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import TextBlock from '@components/TextBlock';
import useLHNEstimatedListSize from '@hooks/useLHNEstimatedListSize';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidDraftComment} from '@libs/DraftCommentUtils';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getIOUReportIDOfLastAction, getLastMessageTextForReport, hasReportErrors} from '@libs/OptionsListUtils';
import {getOneTransactionThreadReportID, getOriginalMessage, getSortedReportActionsForDisplay, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, requiresAttentionFromCurrentUser} from '@libs/ReportUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import OptionRowLHNData from './OptionRowLHNData';
import OptionRowRendererComponent from './OptionRowRendererComponent';
import type {LHNOptionsListProps, RenderItemProps} from './types';

const keyExtractor = (item: string) => `report_${item}`;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions = false, onFirstItemRendered = () => {}}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const flashListRef = useRef<FlashList<string>>(null);
    const route = useRoute();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (attributes) => attributes?.reports, canBeMissing: false});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: false});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false});
    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const estimatedListSize = useLHNEstimatedListSize();
    const shouldShowEmptyLHN = data.length === 0;
    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const isGBRorRBRTooltipDismissed =
        !isLoadingOnyxValue(dismissedProductTrainingMetadata) && isProductTrainingElementDismissed(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GBR_RBR_CHAT, dismissedProductTraining);

    const firstReportIDWithGBRorRBR = useMemo(() => {
        if (isGBRorRBRTooltipDismissed) {
            return undefined;
        }
        return data.find((reportID) => {
            const itemFullReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            if (!itemFullReport) {
                return false;
            }
            if (hasReportErrors(itemFullReport, itemReportActions)) {
                return true;
            }
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`];
            const itemParentReportAction = itemFullReport?.parentReportActionID ? itemParentReportActions?.[itemFullReport?.parentReportActionID] : undefined;
            const hasGBR = requiresAttentionFromCurrentUser(itemFullReport, itemParentReportAction);
            return hasGBR;
        });
    }, [isGBRorRBRTooltipDismissed, data, reportActions, reports]);

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

    const emptyLHNSubtitle = useMemo(
        () => (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter]}>
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText1')}
                />
                <Icon
                    src={Expensicons.MagnifyingGlass}
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
        ],
    );

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item: reportID}: RenderItemProps): ReactElement => {
            const itemFullReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const itemParentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${itemFullReport?.parentReportID}`];
            const itemReportNameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            const itemOneTransactionThreadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getOneTransactionThreadReportID(reportID, itemReportActions, isOffline)}`];
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`];
            const itemParentReportAction = itemFullReport?.parentReportActionID ? itemParentReportActions?.[itemFullReport?.parentReportActionID] : undefined;
            const itemReportAttributes = reportAttributes?.[reportID];

            let invoiceReceiverPolicyID = '-1';
            if (itemFullReport?.invoiceReceiver && 'policyID' in itemFullReport.invoiceReceiver) {
                invoiceReceiverPolicyID = itemFullReport.invoiceReceiver.policyID;
            }
            if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
                invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
            }
            const itemInvoiceReceiverPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`];

            const iouReportIDOfLastAction = getIOUReportIDOfLastAction(itemFullReport);
            const itemIouReportReportActions = iouReportIDOfLastAction ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDOfLastAction}`] : undefined;

            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`];
            const transactionID = isMoneyRequestAction(itemParentReportAction)
                ? getOriginalMessage(itemParentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID
                : CONST.DEFAULT_NUMBER_ID;
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            const hasDraftComment = isValidDraftComment(draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`]);

            const canUserPerformWrite = canUserPerformWriteAction(itemFullReport);
            const sortedReportActions = getSortedReportActionsForDisplay(itemReportActions, canUserPerformWrite);
            const lastReportAction = sortedReportActions.at(0);

            // Get the transaction for the last report action
            const lastReportActionTransactionID = isMoneyRequestAction(lastReportAction)
                ? getOriginalMessage(lastReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID
                : CONST.DEFAULT_NUMBER_ID;
            const lastReportActionTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${lastReportActionTransactionID}`];

            // SidebarUtils.getOptionData in OptionRowLHNData does not get re-evaluated when the linked task report changes, so we have the lastMessageTextFromReport evaluation logic here
            let lastActorDetails: Partial<PersonalDetails> | null =
                itemFullReport?.lastActorAccountID && personalDetails?.[itemFullReport.lastActorAccountID] ? personalDetails[itemFullReport.lastActorAccountID] : null;
            if (!lastActorDetails && lastReportAction) {
                const lastActorDisplayName = lastReportAction?.person?.[0]?.text;
                lastActorDetails = lastActorDisplayName
                    ? {
                          displayName: lastActorDisplayName,
                          accountID: itemFullReport?.lastActorAccountID,
                      }
                    : null;
            }
            const lastMessageTextFromReport = getLastMessageTextForReport(itemFullReport, lastActorDetails, itemPolicy, itemReportNameValuePairs);

            const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={itemFullReport}
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
                    isFocused={!shouldDisableFocusOptions}
                    lastMessageTextFromReport={lastMessageTextFromReport}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    hasDraftComment={hasDraftComment}
                    transactionViolations={transactionViolations}
                    onLayout={onLayoutItem}
                    shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip}
                />
            );
        },
        [
            draftComments,
            onSelectRow,
            optionMode,
            personalDetails,
            policy,
            preferredLocale,
            reportActions,
            reports,
            reportAttributes,
            reportNameValuePairs,
            shouldDisableFocusOptions,
            transactions,
            transactionViolations,
            onLayoutItem,
            isOffline,
            firstReportIDWithGBRorRBR,
        ],
    );

    const extraData = useMemo(
        () => [
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
        ],
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
            if (isWebOrDesktop) {
                saveScrollIndex(route, Math.floor(e.nativeEvent.contentOffset.y / estimatedItemSize));
            }
            triggerScrollEvent();
        },
        [estimatedItemSize, isWebOrDesktop, route, saveScrollIndex, saveScrollOffset, triggerScrollEvent],
    );

    const onLayout = useCallback(() => {
        const offset = getScrollOffset(route);

        if (!(offset && flashListRef.current) || isWebOrDesktop) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({offset});
        });
    }, [getScrollOffset, route, isWebOrDesktop]);

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
    }, [data, shouldShowEmptyLHN, route, reports, reportActions, policy, personalDetails]);

    return (
        <View style={[style ?? styles.flex1, shouldShowEmptyLHN ? styles.emptyLHNWrapper : undefined]}>
            {shouldShowEmptyLHN ? (
                <BlockingView
                    animation={LottieAnimations.Fireworks}
                    animationStyles={styles.emptyLHNAnimation}
                    animationWebStyle={styles.emptyLHNAnimation}
                    title={translate('common.emptyLHN.title')}
                    shouldShowLink={false}
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
                    estimatedItemSize={estimatedItemSize}
                    overrideProps={{estimatedHeightSize: estimatedItemSize * CONST.LHN_VIEWPORT_ITEM_COUNT}}
                    extraData={extraData}
                    showsVerticalScrollIndicator={false}
                    onLayout={onLayout}
                    onScroll={onScroll}
                    estimatedListSize={estimatedListSize}
                    initialScrollIndex={isWebOrDesktop ? getScrollIndex(route) : undefined}
                />
            )}
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default memo(LHNOptionsList);
