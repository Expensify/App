import {cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavCompactCreateButton from '@components/Navigation/FlatNavigationBar/FlatNavCompactCreateButton';
import FlatNavCreateButton from '@components/Navigation/FlatNavigationBar/FlatNavCreateButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import FloatingActionButtonAndPopover from '@pages/inbox/sidebar/FloatingActionButtonAndPopover';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentType, ReactElement, RefObject} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string; children?: React.ReactNode}>;
    Pressable: ComponentType<{testID: string; onPress: () => void}>;
};

type MenuProps = {
    isVisible: boolean;
    anchorRef: RefObject<unknown>;
    anchorPosition?: AnchorPosition;
    anchorAlignment?: AnchorAlignment;
};

const MEASURED_ANCHOR = {horizontal: 14, vertical: 128, width: 204, height: 32};

let mockMenuProps: MenuProps | undefined;
const mockCalculatePopoverPosition = jest.fn<Promise<typeof MEASURED_ANCHOR>, [RefObject<unknown>, AnchorAlignment]>(() => Promise.resolve(MEASURED_ANCHOR));

jest.mock('@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return (props: MenuProps) => {
        mockMenuProps = props;
        return props.isVisible ? createElement(View, {testID: 'CreateMenuPopover'}) : null;
    };
});

jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABButtons', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {Pressable} = jest.requireActual<ReactNativeActual>('react-native');
    return ({onPress}: {onPress: () => void}) => createElement(Pressable, {testID: 'FloatingActionButton', onPress});
});

jest.mock('@components/Tooltip', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return ({text, children}: {text: string; children: React.ReactNode}) => createElement(View, {testID: `Tooltip:${text}`}, children);
});

jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: mockCalculatePopoverPosition}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));

function renderWithProviders(element: ReactElement) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{element}</ComposeProviders>);
}

type RenderedTree = ReturnType<typeof screen.toJSON> | string;

const BUTTON_HEIGHT = variables.flatNavigationBarCreateButtonHeight;

/** Whether any element in the rendered tree has a flattened style matching the predicate. */
function hasStyle(node: RenderedTree, matches: (style: ViewStyle) => boolean): boolean {
    if (!node || typeof node === 'string') {
        return false;
    }
    if (Array.isArray(node)) {
        return node.some((child) => hasStyle(child, matches));
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the test renderer types host props as any
    const nodeStyle: StyleProp<ViewStyle> = node.props.style;
    const style = StyleSheet.flatten(nodeStyle);
    if (style && matches(style)) {
        return true;
    }
    return (node.children ?? []).some((child) => hasStyle(child, matches));
}

function isCircle(style: ViewStyle) {
    return style.width === BUTTON_HEIGHT && style.height === BUTTON_HEIGHT && style.borderRadius === BUTTON_HEIGHT / 2;
}

function isFullWidth(style: ViewStyle) {
    return style.width === '100%';
}

function getCreateButton() {
    return screen.getByRole(CONST.ROLE.BUTTON, {name: 'Create'});
}

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    jest.clearAllMocks();
    mockCalculatePopoverPosition.mockImplementation(() => Promise.resolve(MEASURED_ANCHOR));
    mockMenuProps = undefined;
    await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
});

afterEach(async () => {
    cleanup();
    await Onyx.clear();
});

describe('FlatNavCreateButton', () => {
    it('opens the create menu right below itself, at the position measured from the button', async () => {
        // Given the Create button in the flat bar
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByTestId('CreateMenuPopover')).not.toBeOnTheScreen();

        // When it is pressed
        fireEvent.press(getCreateButton());
        await waitForBatchedUpdatesWithAct();

        // Then the menu opens at the button's own measured position, opening down from its left edge, so it follows
        // the button wherever the bar lays it out instead of a position computed from the bar's sizes
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        const measuredRef = mockCalculatePopoverPosition.mock.calls.at(0)?.[0];
        expect(measuredRef).toBe(mockMenuProps?.anchorRef);
        expect(measuredRef?.current).toBeTruthy();
        expect(mockMenuProps?.anchorPosition).toEqual({horizontal: MEASURED_ANCHOR.horizontal, vertical: MEASURED_ANCHOR.vertical});
        expect(mockMenuProps?.anchorAlignment).toEqual({horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP});
        expect(getCreateButton()).toBeExpanded();
    });

    it('closes the menu when pressed again', async () => {
        // Given the Create button with its menu open
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(getCreateButton());
        await waitForBatchedUpdatesWithAct();

        // When it is pressed a second time
        fireEvent.press(getCreateButton());
        await waitForBatchedUpdatesWithAct();

        // Then the menu closes without measuring again, the same toggle the floating action button has
        expect(screen.queryByTestId('CreateMenuPopover')).not.toBeOnTheScreen();
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        expect(getCreateButton()).toBeCollapsed();
    });

    it('opens the menu once when pressed twice before the button is measured', async () => {
        // Given a measurement that has not resolved yet, as on a slow frame
        let resolveMeasurement: (anchor: typeof MEASURED_ANCHOR) => void = () => {};
        mockCalculatePopoverPosition.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveMeasurement = resolve;
                }),
        );
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // When the button is pressed twice and only then measured
        fireEvent.press(getCreateButton());
        fireEvent.press(getCreateButton());
        resolveMeasurement(MEASURED_ANCHOR);
        await waitForBatchedUpdatesWithAct();

        // Then the second press is ignored instead of starting another measurement, and the menu is open
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        expect(getCreateButton()).toBeExpanded();
    });

    it('shows the "Create" label by default', async () => {
        // Given the expanded bar's Create button
        // When it renders
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // Then the label is drawn inside the button, next to the "+" icon
        expect(within(getCreateButton()).getByText('Create')).toBeOnTheScreen();
    });

    it('draws the labelled button as a full width pill without a tooltip', async () => {
        // Given the expanded bar's Create button
        // When it renders
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // Then it spans the bar's width rather than being a circle, with no hover tooltip, because the label already says "Create"
        expect(screen.queryByTestId('Tooltip:Create')).not.toBeOnTheScreen();
        expect(hasStyle(screen.toJSON(), isFullWidth)).toBe(true);
        expect(hasStyle(screen.toJSON(), isCircle)).toBe(false);
    });
});

describe('FlatNavCompactCreateButton', () => {
    it('draws a 32px round "+" with a "Create" tooltip', async () => {
        // Given the round "+" a collapsed bar uses
        // When it renders
        renderWithProviders(<FlatNavCompactCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // Then it is a circle like the old floating action button, and hovering it names it, as the FAB's tooltip did
        expect(within(screen.getByTestId('Tooltip:Create')).getByRole(CONST.ROLE.BUTTON, {name: 'Create'})).toBeOnTheScreen();
        expect(hasStyle(screen.toJSON(), isCircle)).toBe(true);
    });

    it('has no visible label but keeps the accessible name and opens the same menu below itself', async () => {
        // Given the round "+" a collapsed bar uses
        renderWithProviders(<FlatNavCompactCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // When it is pressed
        fireEvent.press(getCreateButton());
        await waitForBatchedUpdatesWithAct();

        // Then only the icon shows, screen readers still hear "Create", and the menu opens at the button's measured position
        expect(screen.queryByText('Create')).not.toBeOnTheScreen();
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        const measuredRef = mockCalculatePopoverPosition.mock.calls.at(0)?.[0];
        expect(measuredRef).toBe(mockMenuProps?.anchorRef);
        expect(measuredRef?.current).toBeTruthy();
        expect(mockMenuProps?.anchorPosition).toEqual({horizontal: MEASURED_ANCHOR.horizontal, vertical: MEASURED_ANCHOR.vertical});
        expect(getCreateButton()).toBeExpanded();
    });
});

describe('FloatingActionButtonAndPopover', () => {
    it('opens the create menu at its default placement, without measuring itself', async () => {
        // Given the floating action button outside the flat bar
        renderWithProviders(<FloatingActionButtonAndPopover />);
        await waitForBatchedUpdatesWithAct();

        // When it is pressed
        fireEvent.press(screen.getByTestId('FloatingActionButton'));
        await waitForBatchedUpdatesWithAct();

        // Then it keeps the create menu's default placement with no anchor override, so the flat bar's measuring does not leak into it
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        expect(mockMenuProps?.anchorPosition).toBeUndefined();
        expect(mockMenuProps?.anchorAlignment).toBeUndefined();
        expect(mockCalculatePopoverPosition).not.toHaveBeenCalled();
    });
});
