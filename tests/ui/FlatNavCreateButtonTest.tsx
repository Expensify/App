import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavCreateButton from '@components/Navigation/FlatNavigationBar/FlatNavCreateButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';

import type {ComponentType, RefObject} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

type MenuProps = {
    isVisible: boolean;
    anchorRef: RefObject<unknown>;
    anchorPosition?: AnchorPosition;
};

const MEASURED_ANCHOR = {horizontal: 14, vertical: 128, width: 204, height: 32};

let mockMenuProps: MenuProps | undefined;
const mockCalculatePopoverPosition = jest.fn<Promise<typeof MEASURED_ANCHOR>, [RefObject<unknown>]>(() => Promise.resolve(MEASURED_ANCHOR));

jest.mock('@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return (props: MenuProps) => {
        mockMenuProps = props;
        return props.isVisible ? createElement(View, {testID: 'CreateMenuPopover'}) : null;
    };
});

jest.mock('@hooks/usePopoverPosition', () => () => ({calculatePopoverPosition: mockCalculatePopoverPosition}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));

function renderButton() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FlatNavCreateButton />
        </ComposeProviders>,
    );
}

function pressCreate() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Create'}));
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
    it('opens the create menu at the position measured from the button', async () => {
        // Given the Create button in the flat bar
        renderButton();
        await waitForBatchedUpdatesWithAct();

        // When it is pressed
        pressCreate();
        await waitForBatchedUpdatesWithAct();

        // Then the menu opens anchored to the button itself, at the position measured from it
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
        const measuredRef = mockCalculatePopoverPosition.mock.calls.at(0)?.[0];
        expect(measuredRef?.current).toBeTruthy();
        expect(mockMenuProps?.anchorRef).toBe(measuredRef);
        expect(mockMenuProps?.anchorPosition).toEqual({horizontal: MEASURED_ANCHOR.horizontal, vertical: MEASURED_ANCHOR.vertical});
    });

    it('closes the menu when pressed again', async () => {
        // Given the Create button with its menu open
        renderButton();
        await waitForBatchedUpdatesWithAct();
        pressCreate();
        await waitForBatchedUpdatesWithAct();

        // When it is pressed a second time
        pressCreate();
        await waitForBatchedUpdatesWithAct();

        // Then the menu closes without measuring the button again
        expect(screen.queryByTestId('CreateMenuPopover')).not.toBeOnTheScreen();
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
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
        renderButton();
        await waitForBatchedUpdatesWithAct();

        // When the button is pressed twice and only then measured
        pressCreate();
        pressCreate();
        resolveMeasurement(MEASURED_ANCHOR);
        await waitForBatchedUpdatesWithAct();

        // Then the second press is ignored instead of starting another measurement, and the menu is open
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('CreateMenuPopover')).toBeOnTheScreen();
    });
});
