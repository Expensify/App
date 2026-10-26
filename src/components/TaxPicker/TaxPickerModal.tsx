import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import SelectionListPopoverHeader, {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSelectionListPopoverLayout from '@hooks/useSelectionListPopoverLayout';

import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getEnabledTaxRateCount} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';
import Animated from 'react-native-reanimated';

import TaxPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

/** The list's name and how many rates it offers: all the pop-over needs from the policy to size and title itself */
const taxRatesSummarySelector = (policy: Policy | undefined) => ({name: policy?.taxRates?.name, enabledCount: getEnabledTaxRateCount(policy?.taxRates?.taxes ?? {})});

type TaxPickerModalProps = {
    onClose: () => void;

    /** The policy whose tax rates should be shown */
    policyID: string | undefined;

    /** The expense the rate is picked for, which the list reads the current rate and default off */
    transactionID?: string;

    /** The expense's current tax rate, as its row shows it, so the list can mark it */
    selectedTaxRate?: string;

    /** What is being done to the expense, which decides whether the list reads its draft or the saved expense */
    action?: IOUAction;

    iouType?: IOUType;

    /** Called when the user confirms a tax rate. `shouldClearTax` asks to clear the tax instead, for a rate the workspace no longer has */
    onSelected?: (tax: TaxRatesOption, shouldClearTax?: boolean) => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header with the tax's name and, on a narrow layout, a back button that closes the list */
    shouldShowHeader?: boolean;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

/**
 * The tax rate list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one.
 * Picking a rate hands it to `onSelected` and closes the container, as the category and tag lists do.
 */
function TaxPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    transactionID,
    selectedTaxRate,
    action,
    iouType,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
    shouldShowHeader = false,
}: TaxPickerModalProps) {
    const {translate} = useLocalize();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [taxRatesSummary] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: taxRatesSummarySelector});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();
    const enabledTaxRatesCount = taxRatesSummary?.enabledCount ?? 0;

    const {popoverDimensions, innerContainerStyle, outerStyle, avoidKeyboard, contentStyle} = useSelectionListPopoverLayout({
        optionCount: renderedRowCount ?? enabledTaxRatesCount,
        // The list shows its search input from the standard limit, and sizes itself the same way.
        isSearchable: enabledTaxRatesCount >= CONST.STANDARD_LIST_ITEM_LIMIT,
        popoverWidth,
        popoverHeight,
        shouldFitContentHeight,
        headerHeight: shouldShowHeader ? SELECTION_LIST_POPOVER_HEADER_HEIGHT : 0,
    });

    const handleTaxRateSelected = (tax: TaxRatesOption, shouldClearTax?: boolean) => {
        onSelected?.(tax, shouldClearTax);
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={innerContainerStyle}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
            avoidKeyboard={avoidKeyboard}
            outerStyle={outerStyle}
            // The sheet sizes itself to the window and its list scrolls on its own, so the modal must not cap or wrap it in landscape.
            shouldLimitHeightIfBottomDockedInLandscapeMode={false}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <Animated.View style={contentStyle}>
                {shouldShowHeader && (
                    <SelectionListPopoverHeader
                        title={taxRatesSummary?.name ?? translate('iou.taxRate')}
                        onBackButtonPress={onClose}
                        backButtonSentryLabel={CONST.SENTRY_LABEL.TAX_PICKER_MODAL.BACK_BUTTON}
                    />
                )}
                <TaxPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    policyID={policyID}
                    transactionID={transactionID}
                    selectedTaxRate={selectedTaxRate}
                    action={action}
                    iouType={iouType}
                    onSubmit={handleTaxRateSelected}
                    // Tapping the rate the expense already has leaves it alone, as the full-page selector does, and only closes the list.
                    onDismiss={onClose}
                    shouldAutoFocusSearchInput
                />
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

export default TaxPickerModal;
