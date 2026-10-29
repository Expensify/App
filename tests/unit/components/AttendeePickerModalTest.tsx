import {fireEvent, render, screen} from '@testing-library/react-native';

import AttendeePickerModal from '@components/AttendeePicker/AttendeePickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import type useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';

import type MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';

import type {ComponentProps} from 'react';

import React from 'react';

let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth, isInLandscapeMode: false})));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1200, windowHeight: 800})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => 0));
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: false, keyboardActiveHeight: 0})));
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingTop: 0, paddingBottom: 0})));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// The list itself is covered elsewhere; here only what the container hands it, and the screen status it reads, matter.
type SelectorProps = ComponentProps<typeof MoneyRequestAttendeeSelector>;
let mockSelectorProps: SelectorProps | undefined;
let mockDidScreenTransitionEnd: boolean | undefined;
jest.mock('@pages/iou/request/MoneyRequestAttendeeSelector', () => (props: SelectorProps) => {
    mockSelectorProps = props;
    // The real list only builds its options once the screen has settled, which it reads through this hook.
    mockDidScreenTransitionEnd = jest.requireActual<{default: typeof useScreenWrapperTransitionStatus}>('@hooks/useScreenWrapperTransitionStatus').default().didScreenTransitionEnd;
    return null;
});

let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

const attendees: Attendee[] = [{email: 'creator@example.com', displayName: 'Creator', avatarUrl: ''}];

const renderModal = (props: Partial<ComponentProps<typeof AttendeePickerModal>> = {}) =>
    render(
        <AttendeePickerModal
            isVisible
            onClose={jest.fn()}
            anchorPosition={{horizontal: 0, vertical: 0}}
            attendees={attendees}
            onAttendeesChanged={jest.fn()}
            onApply={jest.fn()}
            iouType={CONST.IOU.TYPE.SUBMIT}
            {...props}
        />,
    );

describe('AttendeePickerModal', () => {
    beforeEach(() => {
        mockPopoverProps = undefined;
        mockSelectorProps = undefined;
        mockDidScreenTransitionEnd = undefined;
        mockIsSmallScreenWidth = false;
    });

    it('shows the attendee list with an Apply button and a "Search for someone" input, on a screen it reads as settled', () => {
        // Given the expense form's attendees row
        const onAttendeesChanged = jest.fn();

        // When the list opens in the container
        renderModal({onAttendeesChanged});

        // Then it is the full page's list, started from the expense's attendees, with its button reading Apply rather than
        // Save and its search input asking for someone, and it reads the screen as settled, as it would on its page once the
        // transition ended, so it builds its options rather than waiting for a transition the container never has
        expect(mockSelectorProps?.attendees).toEqual(attendees);
        expect(mockSelectorProps?.onAttendeesAdded).toBe(onAttendeesChanged);
        expect(mockSelectorProps?.iouType).toBe(CONST.IOU.TYPE.SUBMIT);
        expect(mockSelectorProps?.confirmButtonText).toBe('common.apply');
        expect(mockSelectorProps?.searchInputLabel).toBe('selectionList.searchForSomeone');
        expect(mockDidScreenTransitionEnd).toBe(true);
    });

    it('applies the selection when the list confirms it', () => {
        // Given the list open in the container
        const onApply = jest.fn();
        const onClose = jest.fn();
        renderModal({onApply, onClose});

        // When the user confirms, with the Apply button or the Enter key on a focused attendee
        mockSelectorProps?.onFinish();

        // Then the selection is applied; the caller decides whether to close, as it may keep the list open on an empty selection
        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('opens at the standard dropdown size on a wide layout', () => {
        // Given a wide layout and a caller passing no size of its own
        // When the list opens
        renderModal();

        // Then the pop-over is the standard size, since the list always has a search input and more rows than it can show
        expect(mockPopoverProps?.popoverDimensions).toEqual({width: CONST.POPOVER_DROPDOWN_WIDTH, height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT});
    });

    it('shows a header naming the field whose back button closes the list', () => {
        // Given the attendees row on a phone
        mockIsSmallScreenWidth = true;
        const onClose = jest.fn();
        renderModal({onClose, shouldShowHeader: true});

        // When the back button in the header is pressed
        expect(screen.getByText('iou.attendees')).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the list closes
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
