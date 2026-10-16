import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {InlineTextEditCell} from '@components/EditableCell';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

// The edit TextInput calls useIsFocused/useNavigation, which need a NavigationContainer ancestor we don't render here.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: () => true,
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));

// Forces the cell into the "wide/editable" layout branch, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
}));

// EditableCell only enables the edit-pencil button while the cell is hovered, which jsdom can't simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

// Mirrors the mock pattern used in TotalCellTest.tsx to make the pencil button directly pressable.
jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function mockPressableWithFeedback({
        children,
        onPress,
        accessibilityLabel,
    }: {
        children: React.ReactNode | ((state: {hovered: boolean; pressed: boolean}) => React.ReactNode);
        onPress: () => void;
        accessibilityLabel?: string;
    }) {
        const content = typeof children === 'function' ? children({hovered: false, pressed: false}) : children;
        return (
            <TouchableOpacity
                testID="mock-edit-button"
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
            >
                {content}
            </TouchableOpacity>
        );
    }
    return {__esModule: true, default: mockPressableWithFeedback};
});

const RAW_NAME = 'Cars - 6/1/26 - 8/31/26';
const DISPLAY_NAME = 'Cars';

function renderCell(onSave = jest.fn()) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <InlineTextEditCell
                value={RAW_NAME}
                displayText={DISPLAY_NAME}
                accessibilityLabel="Name"
                canEdit
                onSave={onSave}
            />
        </ComposeProviders>,
    );
}

describe('InlineTextEditCell', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    it('shows displayText instead of the raw value when not editing', async () => {
        // Given a cell whose display text differs from its raw value
        renderCell();
        await waitForBatchedUpdates();

        // Then the display text is shown, and the raw value is not
        expect(screen.getByText(DISPLAY_NAME)).toBeOnTheScreen();
        expect(screen.queryByText(RAW_NAME)).not.toBeOnTheScreen();
    });

    it('starts editing from the raw value so an unchanged save does not rename', async () => {
        // Given a cell whose display text differs from its raw value
        const onSave = jest.fn();
        renderCell(onSave);
        await waitForBatchedUpdates();

        // When the user starts editing and blurs without typing
        fireEvent.press(await screen.findByTestId('mock-edit-button'));
        const input = await screen.findByLabelText('Name');

        // Then the edit buffer holds the raw value, and nothing is saved
        expect(input.props.value).toBe(RAW_NAME);
        fireEvent(input, 'blur');
        expect(onSave).not.toHaveBeenCalled();
    });
});
