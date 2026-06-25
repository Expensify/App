import type * as ReactNavigationCore from '@react-navigation/core';
import {fireEvent, render, screen} from '@testing-library/react-native';
import type {ReactElement} from 'react';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps, FilterPopupButtonProps, PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import ONYXKEYS from '@src/ONYXKEYS';
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

function buildTree(props: Partial<Pick<FilterPopupButtonProps, 'autoExpandToken'>> = {}): ReactElement {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FilterPopupButton
                PopoverComponent={renderPopoverContent}
                renderButton={renderButton}
                onOverlayClose={mockOnOverlayClose}
                {...props}
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

    it('auto-opens the popover when a new autoExpandToken is provided (Edit filters from the LHN)', async () => {
        const {rerender} = render(buildTree({autoExpandToken: undefined}));
        expect(screen.queryByTestId('filter-footer')).toBeNull();

        rerender(buildTree({autoExpandToken: 1}));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('filter-footer')).toBeOnTheScreen();
    });

    it('blocks a manual open while an alert modal is becoming visible, but autoExpandToken bypasses that guard', async () => {
        await Onyx.set(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true});
        const {rerender} = render(buildTree({autoExpandToken: undefined}));

        // A manual press is ignored while the alert modal is transitioning.
        fireEvent.press(screen.getByTestId('trigger'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByTestId('filter-footer')).toBeNull();

        // The Edit-filters auto-open bypasses the guard so the table loads without waiting for the transition.
        rerender(buildTree({autoExpandToken: 1}));
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
