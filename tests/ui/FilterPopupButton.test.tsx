import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps, FilterPopupButtonHandle, PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationCore from '@react-navigation/core';
import type {ReactElement} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The popover only renders on the wide layout.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));

// Control whether the screen is focused (the auto-open effect and the popover both require focus).
let mockIsFocused = true;
jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<typeof ReactNavigationCore>('@react-navigation/core'),
    useIsFocused: () => mockIsFocused,
}));

// Resolve the popover position synchronously so opening doesn't depend on async layout measurement.
jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: () => Promise.resolve({horizontal: 0, vertical: 0})}),
}));

// The real popover measures asynchronously and wouldn't render its content in jest; render the children inline when visible.
jest.mock('@components/PopoverWithMeasuredContent', () => {
    function MockPopoverWithMeasuredContent({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) {
        return isVisible ? children : null;
    }
    return MockPopoverWithMeasuredContent;
});

const mockOnOverlayClose = jest.fn();

const renderButton = ({onPress}: ButtonComponentProps) => (
    <PressableWithoutFeedback
        testID="trigger"
        accessibilityLabel="Filters"
        onPress={onPress}
    />
);

const renderPopoverContent = ({closeOverlay}: PopoverComponentProps) => (
    <View testID="filter-footer">
        <PressableWithoutFeedback
            testID="inner-close"
            accessibilityLabel="Close"
            onPress={closeOverlay}
        />
    </View>
);

function buildTree(handleRef?: React.RefObject<FilterPopupButtonHandle | null>): ReactElement {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FilterPopupButton
                PopoverComponent={renderPopoverContent}
                renderButton={renderButton}
                onOverlayClose={mockOnOverlayClose}
                handleRef={handleRef}
            />
        </ComposeProviders>
    );
}

describe('FilterPopupButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsFocused = true;
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    it('opens the popover when the trigger button is pressed', async () => {
        render(buildTree());
        expect(screen.queryByTestId('filter-footer')).toBeNull();

        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('filter-footer')).toBeOnTheScreen();
    });

    it('toggles the popover closed on a second press and notifies onOverlayClose', async () => {
        render(buildTree());

        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('filter-footer')).toBeOnTheScreen();

        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('filter-footer')).toBeNull();
        expect(mockOnOverlayClose).toHaveBeenCalledTimes(1);
    });

    it('notifies onOverlayClose when the popover content closes itself (e.g. Cancel/Save)', async () => {
        render(buildTree());

        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('inner-close'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('filter-footer')).toBeNull();
        expect(mockOnOverlayClose).toHaveBeenCalledTimes(1);
    });

    it('opens the popover through the imperative handle (Edit filters from the LHN)', async () => {
        const handleRef = React.createRef<FilterPopupButtonHandle | null>();
        render(buildTree(handleRef));
        expect(screen.queryByTestId('filter-footer')).toBeNull();

        act(() => handleRef.current?.open());
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('filter-footer')).toBeOnTheScreen();
    });

    it('blocks a manual open while an alert modal is becoming visible, but the imperative open bypasses that guard', async () => {
        await Onyx.set(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true});
        const handleRef = React.createRef<FilterPopupButtonHandle | null>();
        render(buildTree(handleRef));

        // A manual press is ignored while the alert modal is transitioning.
        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByTestId('filter-footer')).toBeNull();

        // The Edit-filters imperative open bypasses the guard so the table loads without waiting for the transition.
        act(() => handleRef.current?.open());
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('filter-footer')).toBeOnTheScreen();
    });

    it('does not render the popover while the screen is not focused', async () => {
        mockIsFocused = false;
        render(buildTree());

        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('filter-footer')).toBeNull();
    });
});
