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
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getCachedLastMessageText, getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {
    getLastVisibleAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getReportActionActorAccountID,
    isInviteOrRemovedAction,
    isReportPreviewAction,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import OptionRowLHNData from './OptionRowLHNData';
import OptionRowRendererComponent from './OptionRowRendererComponent';
import type {LHNOptionsListProps, RenderItemProps} from './types';
import useEmptyLHNIllustration from './useEmptyLHNIllustration';

const keyExtractor = (item: Report) => `report_${item.reportID}`;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions = false, onFirstItemRendered = () => {}}: LHNOptionsListProps) {
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
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {canBeMissing: true});
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

    const reportsRef = useRef(reports);
    const reportActionsRef = useRef(reportActions);
    const reportNameValuePairsRef = useRef(reportNameValuePairs);
    const reportMetadataRef = useRef(reportMetadataCollection);
    const personalDetailsRef = useRef(personalDetails);
    const transactionsRef = useRef(transactions);
    const draftCommentsRef = useRef(draftComments);
    const policyRef = useRef(policy);
    const isOfflineRef = useRef(isOffline);

    useEffect(() => {
        reportsRef.current = reports;
    }, [reports]);

    useEffect(() => {
        reportActionsRef.current = reportActions;
    }, [reportActions]);

    useEffect(() => {
        reportNameValuePairsRef.current = reportNameValuePairs;
    }, [reportNameValuePairs]);

    useEffect(() => {
        reportMetadataRef.current = reportMetadataCollection;
    }, [reportMetadataCollection]);

    useEffect(() => {
        personalDetailsRef.current = personalDetails;
    }, [personalDetails]);

    useEffect(() => {
        transactionsRef.current = transactions;
    }, [transactions]);

    useEffect(() => {
        draftCommentsRef.current = draftComments;
    }, [draftComments]);

    useEffect(() => {
        policyRef.current = policy;
    }, [policy]);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

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
            const reportID = item.reportID;
            const itemParentReport = reportsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT}${item.parentReportID}`];
            const itemReportNameValuePairs = reportNameValuePairsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const chatReport = reportsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT}${item.chatReportID}`];
            const itemReportActions = reportActionsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            const itemOneTransactionThreadReport =
                reportsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT}${getOneTransactionThreadReportID(item, chatReport, itemReportActions, isOfflineRef.current)}`];
            const itemParentReportActions = reportActionsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${item?.parentReportID}`];
            const itemParentReportAction = item?.parentReportActionID ? itemParentReportActions?.[item?.parentReportActionID] : undefined;
            const itemReportAttributes = reportAttributes?.[reportID];

            let invoiceReceiverPolicyID = '-1';
            if (item?.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
                invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
            }
            if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
                invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
            }
            const itemInvoiceReceiverPolicy = policyRef.current?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`];

            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${item?.policyID}`];
            const hasDraftComment =
                !!draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] &&
                !draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`]?.match(CONST.REGEX.EMPTY_COMMENT);

            const isReportArchived = !!itemReportNameValuePairs?.private_isArchived;
            const canUserPerformWrite = canUserPerformWriteAction(item, isReportArchived);
            const lastAction = getLastVisibleAction(
                reportID,
                canUserPerformWrite,
                {},
                itemReportActions ? {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: itemReportActions} : undefined,
                visibleReportActionsData,
            );

            const lastActorAccountID = getReportActionActorAccountID(lastAction, undefined, item) ?? item.lastActorAccountID;
            let lastActorDetails: Partial<PersonalDetails> | null = lastActorAccountID && personalDetails?.[lastActorAccountID] ? personalDetails[lastActorAccountID] : null;

            if (!lastActorDetails && lastAction) {
                const lastActorDisplayName = lastAction?.person?.[0]?.text;
                lastActorDetails = lastActorDisplayName
                    ? {
                          displayName: lastActorDisplayName,
                          accountID: lastActorAccountID,
                      }
                    : null;
            }

            const movedFromReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
            const movedToReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`];
            const itemReportMetadata = reportMetadataCollection?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

            const shouldAlwaysRecalculateMessage = isReportArchived || isReportPreviewAction(lastAction);
            const baseMessage = shouldAlwaysRecalculateMessage ? undefined : item.lastMessageText;
            const lastMessageTextFromReport =
                baseMessage ??
                getCachedLastMessageText(reportID, () =>
                    getLastMessageTextForReport({
                        translate,
                        report: item,
                        lastActorDetails,
                        movedFromReport,
                        movedToReport,
                        policy: itemPolicy,
                        isReportArchived, // już jako boolean
                        policyForMovingExpensesID,
                        reportMetadata: itemReportMetadata,
                        visibleReportActionsDataParam: visibleReportActionsData,
                        lastAction,
                        currentUserAccountID,
                    }),
                );

            const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

            let lastActionReport: OnyxEntry<Report> | undefined;
            if (isInviteOrRemovedAction(lastAction)) {
                const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
                lastActionReport = reportsRef.current?.[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage?.reportID}`];
            }

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={item}
                    reportAttributes={itemReportAttributes}
                    oneTransactionThreadReport={itemOneTransactionThreadReport}
                    reportNameValuePairs={itemReportNameValuePairs}
                    parentReportAction={itemParentReportAction}
                    policy={itemPolicy}
                    invoiceReceiverPolicy={itemInvoiceReceiverPolicy}
                    personalDetails={personalDetailsRef.current ?? {}}
                    viewMode={optionMode}
                    isOptionFocused={!shouldDisableFocusOptions}
                    lastMessageTextFromReport={lastMessageTextFromReport ?? ''}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    hasDraftComment={hasDraftComment}
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
                    movedFromReport={movedFromReport}
                    movedToReport={movedToReport}
                    currentUserAccountID={currentUserAccountID}
                />
            );
        },
        [
            reportAttributes,
            policyForMovingExpensesID,
            firstReportIDWithGBRorRBR,
            optionMode,
            shouldDisableFocusOptions,
            onSelectRow,
            preferredLocale,
            onLayoutItem,
            activePolicyID,
            introSelected?.choice,
            onboarding,
            isFullscreenVisible,
            isReportsSplitNavigatorLast,
            isScreenFocused,
            localeCompare,
            translate,
            visibleReportActionsData,
            currentUserAccountID,
        ],
    );

    const extraData = useMemo(
        () => [
            Object.keys(reportActions ?? {}).length,
            Object.keys(reports ?? {}).length,
            Object.keys(reportAttributes ?? {}).length,
            Object.keys(reportNameValuePairs ?? {}).length,
            Object.keys(transactionViolations ?? {}).length,
            Object.keys(policy ?? {}).length,
            Object.keys(personalDetails ?? {}).length,
            data.length,
            Object.keys(draftComments ?? {}).length,
            optionMode,
            preferredLocale,
            Object.keys(transactions ?? {}).length,
            isOffline,
            isScreenFocused,
            isReportsSplitNavigatorLast,
        ],
        [
            Object.keys(reportActions ?? {}).length,
            Object.keys(reports ?? {}).length,
            Object.keys(reportAttributes ?? {}).length,
            Object.keys(reportNameValuePairs ?? {}).length,
            Object.keys(transactionViolations ?? {}).length,
            Object.keys(policy ?? {}).length,
            Object.keys(personalDetails ?? {}).length,
            data.length,
            Object.keys(draftComments ?? {}).length,
            optionMode,
            preferredLocale,
            Object.keys(transactions ?? {}).length,
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
