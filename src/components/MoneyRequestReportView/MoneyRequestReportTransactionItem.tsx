import {useEditingCellState} from '@components/EditableCell';
import ErrorMessageRow from '@components/ErrorMessageRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';

import useCopyableTextRowPress, {isPressStartOnCopyableText} from '@hooks/useCopyableTextRowPress';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';

import {getCardDescription} from '@libs/CardUtils';
import ControlSelection from '@libs/ControlSelection';
import canUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {
    EMPTY_CARDS,
    getReportRowCards,
    getReportRowPolicyCategories,
    getTransactionRejectErrorKey,
    getVisibleReportRowViolations,
    isSelectableReportTransaction,
} from '@libs/MoneyRequestReportUtils';
import {hasFlexColumn} from '@libs/SearchUIUtils';
import {COPYABLE_ROW_DATA_SET} from '@libs/SelectionScraper';
import {getTransactionPendingAction} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import {clearError} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Policy, PolicyCategories, PolicyTagLists, Report, TransactionViolations} from '@src/types/onyx';
import type {Errors, TranslationKeyErrors} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef, useState} from 'react';

import type {TransactionWithOptionalHighlight} from './MoneyRequestReportTransactionList';

type MoneyRequestReportTransactionItemProps = {
    /** ID of the transaction this row renders. The row reads the transaction, its card and its violations itself, so a write to one transaction re-renders only its row. */
    transactionID: string;

    /** Login of the report owner, used to filter the violations the current user can see */
    reportOwnerLogin: string | undefined;

    /** ID of the report to which the transaction belongs */
    reportID: string;

    /** ID of the report's policy */
    policyID: string | undefined;

    /** Report to which the transaction belongs, without the fields rows never read */
    report: OnyxEntry<Report>;

    /** Policy to which the transaction belongs, without the fields rows never read */
    policy: OnyxEntry<Policy>;

    /** Tag lists for the policy to which the transaction belongs */
    policyTagLists?: PolicyTagLists;

    /** Whether the mobile selection mode is enabled */
    isSelectionModeEnabled: boolean;

    /** Callback function triggered upon pressing a transaction checkbox. */
    toggleTransaction: (transactionID: string, shiftKey?: boolean) => void;

    /** Callback function triggered upon pressing a transaction. */
    handleOnPress: (transactionID: string) => void;

    /** Callback function triggered upon long pressing a transaction. */
    handleLongPress: (transactionID: string) => void;

    isSelected: boolean;
    dateColumnSize: TableColumnSize;
    postedColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    columns: SearchColumnType[];

    /** Callback function that navigates to the transaction thread */
    onArrowRightPress?: (transactionID: string) => void;

    /** Whether this transaction should be highlighted as newly added */
    shouldBeHighlighted: boolean;

    isLastItem?: boolean;
    shouldScrollHorizontally?: boolean;

    /** Precomputed transaction-thread report ID for this transaction. Lets the RBR row early-return for clean rows
     * instead of mounting the heavy RBR inner; the parent computes it once so rows don't scan report actions individually. */
    transactionThreadReportID?: string;
};

// `shouldBeHighlighted` is omitted: the highlight animation is computed by the outer component (so its timeline
// survives the narrow↔wide swap) and reaches the body as `animatedHighlightStyle`.
type MoneyRequestReportTransactionItemBodyProps = Omit<MoneyRequestReportTransactionItemProps, 'transactionID' | 'reportOwnerLogin' | 'reportID' | 'policyID' | 'shouldBeHighlighted'> & {
    transaction: TransactionWithOptionalHighlight;

    /** Violations of this transaction the current user can see */
    violations: TransactionViolations;

    /** The transaction's category from the policy categories */
    policyCategories?: PolicyCategories;

    /** The transaction's card from the card list */
    nonPersonalAndWorkspaceCards: CardList;

    /** Inline-edit values from `useTransactionInlineEdit`. Undefined on narrow layouts where the hook is skipped. */
    inlineEdit?: InlineEditValues;

    /** Highlight animation style, computed by the parent so its state survives the narrow↔wide swap on resize. */
    animatedHighlightStyle: ReturnType<typeof useRowHighlightAnimation>;

    shouldSkipDeferRBR?: boolean;
};

function MoneyRequestReportTransactionItemBody({
    transaction,
    violations,
    report,
    policy,
    policyCategories,
    policyTagLists,
    isSelectionModeEnabled,
    toggleTransaction,
    isSelected,
    handleOnPress,
    handleLongPress,
    columns,
    dateColumnSize,
    postedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onArrowRightPress,
    nonPersonalAndWorkspaceCards,
    isLastItem = false,
    shouldScrollHorizontally = false,
    transactionThreadReportID,
    inlineEdit,
    animatedHighlightStyle,
    shouldSkipDeferRBR = false,
}: MoneyRequestReportTransactionItemBodyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {markMouseDownOnCopyableText, markTouchStartOnCopyableText, shouldSuppressCopyableTextRowPress} = useCopyableTextRowPress();

    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);
    // Keep this ref local so React Compiler can prove the after-render event mutations are safe.
    const wasEditingOnMouseDownRef = useRef(false);
    const wasEditingOnPressInRef = useRef(false);
    const wasTouchStartOnCopyableTextRef = useRef(false);

    const shouldUseMediumNarrowLayout = isMediumScreenWidth && !shouldScrollHorizontally;
    const shouldUseNarrowTransactionRow = shouldUseNarrowLayout || shouldUseMediumNarrowLayout;
    let transactionRowStyle: StyleProp<ViewStyle> = [styles.ph3, styles.noBorderRadius];
    // The error message sits inside the row, so it carries the same horizontal padding as the row content.
    let errorRowStyle: StyleProp<ViewStyle> = [styles.ph3, styles.pb3];
    if (shouldUseNarrowLayout) {
        transactionRowStyle = [styles.p4, styles.noBorderRadius];
        errorRowStyle = [styles.ph4, styles.pb4];
    } else if (shouldUseMediumNarrowLayout) {
        transactionRowStyle = [styles.p3, styles.pv2, styles.noBorderRadius];
    }
    const pendingAction = getTransactionPendingAction(transaction);

    // `Transaction.errors` also carries receipt errors, which are objects rendered by their own save/delete UI, so
    // keep only the plain message errors here.
    const messageErrors: Errors = Object.fromEntries(
        Object.entries(transaction.errors ?? {}).filter((entry): entry is [string, string | null] => typeof entry[1] === 'string' || entry[1] === null),
    );

    const rejectErrorKey = getTransactionRejectErrorKey(transaction);
    const rejectError: TranslationKeyErrors = rejectErrorKey ? {[rejectErrorKey]: {translationKey: 'iou.rejectReport.couldNotRejectExpense'}} : {};
    // Same check Select All and shift+click ranges use, so this checkbox is disabled exactly for the rows they skip.
    const isSelectable = isSelectableReportTransaction(transaction);

    // A reject error is terminal for this row, so it replaces any other message rather than stacking with it.
    const transactionErrors: Errors | TranslationKeyErrors = rejectErrorKey ? rejectError : getLatestErrorMessageField({errors: messageErrors});
    const hasTransactionErrors = Object.keys(transactionErrors).length > 0;

    // The last row keeps its bottom border but hides it, so the row height stays the same when a row is added below it.
    // FlashList ignores size changes of 1px or less, so a border that appears later would be covered by the next row.
    const lastRowBorderStyle = isLastItem && styles.borderTransparent;

    const dismissTransactionError = () => {
        clearError(transaction.transactionID);
    };

    const handleMouseDown = (e?: React.MouseEvent) => {
        wasEditingOnMouseDownRef.current = isEditingCell;
        const isCopyableTarget = markMouseDownOnCopyableText(e?.target);

        if (!isEditingCell && !isCopyableTarget) {
            e?.preventDefault();
        }
    };

    const handleHoverIn = () => setShouldDisableHoverStyle(false);

    const handlePress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = () => {
        if (shouldSuppressCopyableTextRowPress()) {
            return;
        }

        // Prevent row press from firing while a cell is being inline-edited (e.g. pressing Space would otherwise open the expense)
        // See https://github.com/Expensify/App/issues/88646 for more details
        if (isEditingCell) {
            return;
        }
        // If a cell was being edited when the user tapped the row, suppress navigation
        // so the second tap doesn't immediately open the transaction detail.
        if (wasEditingOnMouseDownRef.current || wasEditingOnPressInRef.current) {
            wasEditingOnMouseDownRef.current = false;
            wasEditingOnPressInRef.current = false;
            return;
        }
        handleOnPress(transaction.transactionID);
    };

    const handleTouchStart: React.ComponentProps<typeof PressableWithFeedback>['onTouchStart'] = (event) => {
        const isCopyableTextTouchStart = isPressStartOnCopyableText(event);
        wasTouchStartOnCopyableTextRef.current = markTouchStartOnCopyableText(event, isCopyableTextTouchStart);
    };

    const handlePressIn: React.ComponentProps<typeof PressableWithFeedback>['onPressIn'] = () => {
        wasEditingOnPressInRef.current = isEditingCell;
        // Selection only needs to be blocked for touch interactions; desktop mouse selection is handled by onMouseDown.
        if (!canUseTouchScreen()) {
            return;
        }

        // Let copyable values use native long-press/drag selection instead of applying the global selection blocker.
        if (wasTouchStartOnCopyableTextRef.current) {
            return;
        }

        // Preserve the existing row behavior for non-copyable touch targets.
        ControlSelection.block();
    };

    const handlePressableLongPress = () => {
        // Let touch-web long presses on copyable values complete native text selection without opening row actions.
        if (wasTouchStartOnCopyableTextRef.current) {
            return;
        }
        handleLongPress(transaction.transactionID);
    };

    const handlePressOut = () => {
        wasTouchStartOnCopyableTextRef.current = false;
        ControlSelection.unblock();
    };

    useEffect(() => {
        if (!wasRecentlyEditingCell) {
            return;
        }
        queueMicrotask(() => setShouldDisableHoverStyle(true));
    }, [wasRecentlyEditingCell]);

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={transactionErrors}
            shouldShowErrorMessages={false}
            style={!shouldUseNarrowLayout && isLastItem && [styles.tableBottomRadius, styles.overflowHidden]}
        >
            <PressableWithFeedback
                key={transaction.transactionID}
                onPress={handlePress}
                accessibilityLabel={translate('iou.viewDetails')}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REQUEST_REPORT_TRANSACTION_ITEM}
                role={CONST.ROLE.BUTTON}
                isNested
                shouldAllowTextSelection
                id={transaction.transactionID}
                style={[
                    styles.transactionListItemStyle,
                    !shouldUseNarrowLayout
                        ? [StyleUtils.getSearchTableRowPressableStyle(false, isSelected), isLastItem && styles.tableBottomRadius, lastRowBorderStyle]
                        : styles.noBorderRadius,
                ]}
                hoverStyle={[isSelectable && !shouldDisableHoverStyle && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={COPYABLE_ROW_DATA_SET}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onHoverIn={handleHoverIn}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLongPress={handlePressableLongPress}
                disabled={!isSelectable}
                wrapperStyle={[animatedHighlightStyle, styles.userSelectNone, shouldUseNarrowLayout && [StyleUtils.getSelectedBorderBottomStyle(isSelected), lastRowBorderStyle]]}
            >
                {({hovered}) => (
                    <>
                        <TransactionItemRow
                            transactionItem={transaction}
                            violations={violations}
                            report={report}
                            policy={policy}
                            policyCategories={policyCategories}
                            policyTagLists={policyTagLists}
                            isSelected={isSelected}
                            dateColumnSize={dateColumnSize}
                            postedColumnSize={postedColumnSize}
                            amountColumnSize={amountColumnSize}
                            taxAmountColumnSize={taxAmountColumnSize}
                            shouldShowTooltip
                            shouldUseNarrowLayout={shouldUseNarrowTransactionRow}
                            shouldUseFullHeightEditableCellHoverTarget={!shouldUseNarrowTransactionRow}
                            shouldShowCheckbox={!!isSelectionModeEnabled || !isSmallScreenWidth}
                            onCheckboxPress={toggleTransaction}
                            columns={columns}
                            isDisabled={!isSelectable}
                            style={[transactionRowStyle, hasTransactionErrors && styles.offlineFeedbackPending]}
                            onButtonPress={() => {
                                handleOnPress(transaction.transactionID);
                            }}
                            onArrowRightPress={() => onArrowRightPress?.(transaction.transactionID)}
                            isHover={hovered}
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            shouldRemoveTotalColumnFlex={hasFlexColumn(columns)}
                            canEditDate={inlineEdit?.canEditDate}
                            canEditMerchant={inlineEdit?.canEditMerchant}
                            canEditDescription={inlineEdit?.canEditDescription}
                            canEditCategory={inlineEdit?.canEditCategory}
                            canEditAmount={inlineEdit?.canEditAmount}
                            canEditTag={inlineEdit?.canEditTag}
                            onEditDate={inlineEdit?.onEditDate}
                            onEditMerchant={inlineEdit?.onEditMerchant}
                            onEditDescription={inlineEdit?.onEditDescription}
                            onEditCategory={inlineEdit?.onEditCategory}
                            onEditAmount={inlineEdit?.onEditAmount}
                            onEditTag={inlineEdit?.onEditTag}
                            shouldSkipDeferRBR={shouldSkipDeferRBR}
                            transactionThreadReportID={transactionThreadReportID}
                        />
                        <ErrorMessageRow
                            errors={transactionErrors}
                            onDismiss={dismissTransactionError}
                            errorRowStyles={errorRowStyle}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

type InlineEditValues = ReturnType<typeof useTransactionInlineEdit>;

function MoneyRequestReportTransactionItemWithInlineEdit(props: Omit<MoneyRequestReportTransactionItemBodyProps, 'inlineEdit'>) {
    const inlineEdit = useTransactionInlineEdit({
        transactionID: props.transaction.transactionID,
    });

    return (
        <MoneyRequestReportTransactionItemBody
            {...props}
            inlineEdit={inlineEdit}
        />
    );
}

function MoneyRequestReportTransactionItem({
    transactionID,
    reportOwnerLogin,
    shouldBeHighlighted,
    reportID,
    policyID,
    report,
    policy,
    policyTagLists,
    isSelectionModeEnabled,
    toggleTransaction,
    handleOnPress,
    handleLongPress,
    isSelected,
    dateColumnSize,
    postedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    columns,
    onArrowRightPress,
    isLastItem,
    shouldScrollHorizontally,
    transactionThreadReportID,
}: MoneyRequestReportTransactionItemProps) {
    const {translate} = useLocalize();
    const {email, accountID} = useCurrentUserPersonalDetails();
    const {isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();

    const [rawTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [rawViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const cardID = rawTransaction?.cardID;
    const category = rawTransaction?.category;
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: (cardList) => (cardID ? cardList?.[cardID] : undefined)});
    const [cards = EMPTY_CARDS] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: (cardList) => getReportRowCards(cardList, cardID)});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {selector: (categories) => getReportRowPolicyCategories(categories, category)});
    const [fullReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [fullPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // Hoisted out of the body so the highlight animation timeline survives the narrow↔wide
    // component-type swap caused by browser resize.
    const animatedHighlightStyle = useRowHighlightAnimation({
        shouldHighlight: shouldBeHighlighted,
        borderRadius: shouldUseNarrowLayout ? variables.componentBorderRadius : 0,
        shouldApplyOtherStyles: !shouldUseNarrowLayout,
    });

    if (!rawTransaction) {
        return null;
    }

    // Mirrors the layout check inside TransactionItemRow so the narrow body never pays for useTransactionInlineEdit.
    const isNarrowLayout = shouldUseNarrowLayout || (isMediumScreenWidth && !shouldScrollHorizontally);

    // The search API pre-resolves the card name, local Onyx transactions carry the raw one
    const resolvedCardName = card ? getCardDescription(card, translate) : undefined;
    const transaction = resolvedCardName && resolvedCardName !== rawTransaction.cardName ? {...rawTransaction, cardName: resolvedCardName} : rawTransaction;
    const violations = getVisibleReportRowViolations(transaction, rawViolations, email ?? '', accountID ?? CONST.DEFAULT_NUMBER_ID, fullReport, reportOwnerLogin, fullPolicy);

    // Every prop is passed explicitly so React Compiler can reuse the body element, and skip the body, while nothing this row shows has changed
    const Body = isNarrowLayout ? MoneyRequestReportTransactionItemBody : MoneyRequestReportTransactionItemWithInlineEdit;
    return (
        <Body
            transaction={transaction}
            violations={violations}
            report={report}
            policy={policy}
            policyCategories={policyCategories}
            policyTagLists={policyTagLists}
            isSelectionModeEnabled={isSelectionModeEnabled}
            toggleTransaction={toggleTransaction}
            handleOnPress={handleOnPress}
            handleLongPress={handleLongPress}
            isSelected={isSelected}
            dateColumnSize={dateColumnSize}
            postedColumnSize={postedColumnSize}
            amountColumnSize={amountColumnSize}
            taxAmountColumnSize={taxAmountColumnSize}
            columns={columns}
            onArrowRightPress={onArrowRightPress}
            nonPersonalAndWorkspaceCards={cards}
            isLastItem={isLastItem}
            shouldScrollHorizontally={shouldScrollHorizontally}
            transactionThreadReportID={transactionThreadReportID}
            animatedHighlightStyle={animatedHighlightStyle}
            shouldSkipDeferRBR
        />
    );
}

export default MoneyRequestReportTransactionItem;
