import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

// Without a touchscreen the sign is typed with the physical keyboard, so the flip button is not rendered.
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => false,
}));

// The amount edit input calls useIsFocused/useNavigation, which need a NavigationContainer ancestor we don't render here.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: () => true,
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency === 'USD' ? '$' : `${currency ?? 'USD'} `}${((amount ?? 0) / 100).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: jest.fn()}));

// Forces the cell into the "wide/editable" layout branch, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
    useIsDisplayedInWideRHP: () => false,
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
}));

// EditableCell only shows/enables the edit-pencil button while the cell is hovered (isCellHovered from Hoverable),
// which jsdom can't simulate reliably. Force it hovered so the wrapping View's pointerEvents isn't "none". RNTL
// v13's fireEvent.press respects pointerEvents and silently no-ops when a "none" ancestor blocks the target.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

// Mirrors the mock pattern used in AgentsTableRowTest.tsx to make the pencil button directly pressable.
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

const MOCK_TRANSACTION_ID = '1';

describe('TotalCell without a touchscreen', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    it('does not render the flip button while editing an amount whose sign may be flipped', async () => {
        // Given a tracked expense, which allows negative amounts, being edited on a device without a touchscreen
        const transaction: Transaction = {
            ...createRandomTransaction(1),
            transactionID: MOCK_TRANSACTION_ID,
            currency: CONST.CURRENCY.USD,
            modifiedAmount: undefined,
            amount: -1000,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        };
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TotalCell
                    transactionItem={transaction}
                    shouldShowTooltip={false}
                    canEdit
                    onSave={jest.fn()}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdates();

        // When the editor opens
        fireEvent.press(await screen.findByTestId('mock-edit-button'));
        await screen.findByLabelText(/^\u2212?Amount \(USD\)$/);

        // Then no flip button is shown
        expect(screen.queryByLabelText('Flip')).not.toBeOnTheScreen();
    });
});
