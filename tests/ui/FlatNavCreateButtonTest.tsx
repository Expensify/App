import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavCreateButton from '@components/Navigation/FlatNavigationBar/FlatNavCreateButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import FloatingActionButtonAndPopover from '@pages/inbox/sidebar/FloatingActionButtonAndPopover';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentType, ReactElement, RefObject} from 'react';

import React from 'react';
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

jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: mockCalculatePopoverPosition}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));

function renderWithProviders(element: ReactElement) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{element}</ComposeProviders>);
}

function getCreateButton() {
    return screen.getByRole(CONST.ROLE.BUTTON, {name: 'Create'});
}

describe('FlatNavCreateButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockMenuProps = undefined;
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

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
        expect(mockCalculatePopoverPosition.mock.calls.at(0)?.at(0)).toBe(mockMenuProps?.anchorRef);
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

    it('shows the "Create" label by default', async () => {
        // Given the expanded bar's Create button
        // When it renders
        renderWithProviders(<FlatNavCreateButton />);
        await waitForBatchedUpdatesWithAct();

        // Then the label is visible, as in the pre-design's "+ Create"
        expect(screen.getByText('Create')).toBeOnTheScreen();
    });
});

describe('FloatingActionButtonAndPopover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockMenuProps = undefined;
    });

    afterEach(() => {
        cleanup();
    });

    it('opens the same create menu at its default placement', async () => {
        // Given the floating action button outside the flat bar
        renderWithProviders(<FloatingActionButtonAndPopover />);
        await waitForBatchedUpdatesWithAct();

        // When it is pressed
        fireEvent.press(screen.getByTestId('FloatingActionButton'));
        await waitForBatchedUpdatesWithAct();

        // Then it opens the menu the Create button shares, with no anchor override, so its placement is unchanged
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        expect(mockMenuProps?.anchorPosition).toBeUndefined();
        expect(mockMenuProps?.anchorAlignment).toBeUndefined();
        expect(mockCalculatePopoverPosition).not.toHaveBeenCalled();
    });
});
