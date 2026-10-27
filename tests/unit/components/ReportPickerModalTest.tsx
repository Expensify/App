import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import ReportPickerModal from '@components/ReportPicker/ReportPickerModal';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useThemeStyles from '@hooks/useThemeStyles';

import type * as Browser from '@libs/Browser';
import {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import type {IOURequestEditReportCommonProps, ReportListSize} from '@pages/iou/request/step/IOURequestEditReportCommon';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof Browser>('@libs/Browser'),
    isMobile: () => true,
}));

let mockIsSmallScreenWidth = true;
let mockIsInLandscapeMode = false;
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth, isInLandscapeMode: mockIsInLandscapeMode})),
);

const mockWindowHeight = 500;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => 0));
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: false, keyboardActiveHeight: 0})));

// The home indicator area the sheet pads itself above, and no top inset.
const SAFE_AREA_PADDING_BOTTOM = 34;
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingTop: 0, paddingBottom: SAFE_AREA_PADDING_BOTTOM})));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// The list is the full-page selector's own, covered by its tests; here only what the modal hands it, and what it renders
// around the list for the size the list reports, matter.
let mockListProps: IOURequestEditReportCommonProps | undefined;
let mockListSize: ReportListSize = {rowCount: 1, isSearchable: false};
jest.mock('@pages/iou/request/step/IOURequestEditReportCommon', () => (props: IOURequestEditReportCommonProps) => {
    mockListProps = props;
    return props.renderInContainer?.(null, mockListSize) ?? null;
});

let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

const selectReport = jest.fn();

const renderModal = (props: Partial<React.ComponentProps<typeof ReportPickerModal>> = {}) =>
    render(
        <ReportPickerModal
            isVisible
            onClose={jest.fn()}
            anchorPosition={{horizontal: 0, vertical: 0}}
            selectReport={selectReport}
            transactionIDs={['1']}
            isManualDistanceRequest={false}
            isOdometerDistanceRequest={false}
            isDistanceRequest={false}
            isPerDiemRequest={false}
            selectedReportID="report1"
            {...props}
        />,
    );

describe('ReportPickerModal', () => {
    beforeEach(() => {
        mockPopoverProps = undefined;
        mockListProps = undefined;
        mockListSize = {rowCount: 1, isSearchable: false};
        mockIsSmallScreenWidth = true;
        mockIsInLandscapeMode = false;
        selectReport.mockClear();
    });

    it('shows the full-page selector list without its page, and closes it in place', () => {
        // Given the expense form's report row
        const onClose = jest.fn();

        // When its list opens
        renderModal({onClose});

        // Then it is the same list the full page shows, rendered in the container instead of the page, handed the expense it
        // picks for, and both dismissing it and navigating on from it close the container rather than navigating back
        expect(mockListProps?.renderInContainer).toBeDefined();
        expect(mockListProps?.selectedReportID).toBe('report1');
        expect(mockListProps?.transactionIDs).toEqual(['1']);
        expect(mockListProps?.selectReport).toBe(selectReport);
        expect(mockListProps?.shouldAutoFocusSearchInput).toBe(true);
        mockListProps?.onDismiss?.();
        expect(onClose).toHaveBeenCalledTimes(1);
        mockListProps?.onNavigateAway?.();
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('fits the sheet to the rows the list reports, the New report row included', () => {
        // Given a phone, where the list opens as a bottom sheet that fits its content, and a list of the New report row and two reports, without a search input
        mockListSize = {rowCount: 3, isSearchable: false};

        // When the list opens
        renderModal({shouldFitContentHeight: true});

        // Then the sheet is three rows tall plus the bottom safe area, leaving no empty space below the reports
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(getSelectionListPopoverContentHeight({optionCount: 3, isSearchable: false}) + SAFE_AREA_PADDING_BOTTOM);
    });

    it('fills the screen on a phone in landscape, however short the list', () => {
        // Given a phone in landscape and a list with a single report, whose sheet would otherwise fit that one row
        mockIsInLandscapeMode = true;

        // When the expense form's report list opens
        renderModal({shouldFitContentHeight: true});

        // Then the sheet fills the window up to the status bar, which the test harness reports as zero, less its own top
        // padding, and the modal neither caps nor wraps it, so the list scrolls on its own
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        expect(mockPopoverProps?.shouldLimitHeightIfBottomDockedInLandscapeMode).toBe(false);
        expect(mockPopoverProps?.shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode).toBe(false);
    });

    it('shows a wide-layout pop-over of the standard size by default', () => {
        // Given a wide layout and a caller that passes no size of its own
        mockIsSmallScreenWidth = false;

        // When the report list opens
        renderModal();

        // Then it is the standard-size pop-over that may flip when it overflows, the same as the other field pop-overs
        expect(mockPopoverProps?.popoverDimensions).toEqual({width: CONST.POPOVER_DROPDOWN_WIDTH, height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT});
        expect(mockPopoverProps?.shouldSwitchPositionIfOverflow).toBe(true);
    });

    it('shows a header naming the field whose back button closes the list', () => {
        // Given the expense form's report row on a phone
        const onClose = jest.fn();
        renderModal({onClose, shouldShowHeader: true, shouldFitContentHeight: true});

        // When the back button in its header is pressed
        expect(screen.getByText('common.report')).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the list closes, and the sheet had grown by the header, less the list's top padding the sheet's own padding
        // replaces under a header, so it still fits the list's one row
        expect(onClose).toHaveBeenCalledTimes(1);
        const {result: styles} = renderHook(() => useThemeStyles());
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(
            getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}) + SELECTION_LIST_POPOVER_HEADER_HEIGHT - styles.current.pt4.paddingTop + SAFE_AREA_PADDING_BOTTOM,
        );
    });

    it('leaves out the header by default', () => {
        // Given a caller that does not ask for a header
        // When the report list opens
        renderModal();

        // Then there is no back button
        expect(screen.queryByLabelText('common.back')).not.toBeOnTheScreen();
    });
});
