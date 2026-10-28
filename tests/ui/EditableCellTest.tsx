import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {EditableCell} from '@components/EditableCell';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import {WideRHPStateContext} from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';
import type {WideRHPStateContextType} from '@components/WideRHPContextProvider/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ROUTE_KEY = 'expense-report-route';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useRoute: () => ({key: 'expense-report-route', name: '', params: {}}),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// Jest resolves `.native` files, where Wide RHPs never show, so load the web hook.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.requireActual<Record<string, unknown>>('@hooks/useResponsiveLayoutOnWideRHP/index.ts'));

// The native provider doesn't export its state context, and the web one hits an import cycle with the styles in Jest.
jest.mock('@components/WideRHPContextProvider', () => {
    const {createContext} = jest.requireActual<typeof React>('react');
    const {defaultWideRHPStateContextValue: defaultState} = jest.requireActual<{defaultWideRHPStateContextValue: WideRHPStateContextType}>('@components/WideRHPContextProvider/default');
    return {
        ...jest.requireActual<Record<string, unknown>>('@components/WideRHPContextProvider'),
        WideRHPStateContext: createContext(defaultState),
    };
});

// EditableCell only renders the edit-pencil button while hovered, which jsdom can't simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function mockPressableWithFeedback({children}: {children: React.ReactNode}) {
        return (
            <TouchableOpacity
                testID="mock-edit-button"
                accessibilityRole="button"
            >
                {children}
            </TouchableOpacity>
        );
    }
    return {__esModule: true, default: mockPressableWithFeedback};
});

const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const MAIN_PANE_LAYOUT: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isMediumScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: true,
    isSmallScreen: false,
    isInLandscapeMode: false,
};

const RHP_LAYOUT: ResponsiveLayoutResult = {...MAIN_PANE_LAYOUT, shouldUseNarrowLayout: true, isInNarrowPaneModal: true};

const NARROW_SCREEN_LAYOUT: ResponsiveLayoutResult = {...MAIN_PANE_LAYOUT, shouldUseNarrowLayout: true, isSmallScreenWidth: true, isLargeScreenWidth: false, isExtraLargeScreenWidth: false};

// Phone browsers in landscape can pass the large-screen breakpoint and still count as small screens.
const PHONE_LANDSCAPE_LAYOUT: ResponsiveLayoutResult = {...MAIN_PANE_LAYOUT, shouldUseNarrowLayout: true, isSmallScreenWidth: true, isInLandscapeMode: true};

const WIDE_RHP_STATE: WideRHPStateContextType = {...defaultWideRHPStateContextValue, wideRHPRouteKeys: [ROUTE_KEY]};
const SUPER_WIDE_RHP_STATE: WideRHPStateContextType = {...defaultWideRHPStateContextValue, superWideRHPRouteKeys: [ROUTE_KEY]};

// Reused across rerenders so only a context change can re-render the cell.
const CELL = (
    <EditableCell
        canEdit
        isEditing={false}
        onStartEditing={() => {}}
    >
        <Text>$10.00</Text>
    </EditableCell>
);

function buildTree(wideRHPState: WideRHPStateContextType = defaultWideRHPStateContextValue) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WideRHPStateContext.Provider value={wideRHPState}>{CELL}</WideRHPStateContext.Provider>
        </ComposeProviders>
    );
}

function renderCell(wideRHPState?: WideRHPStateContextType) {
    return render(buildTree(wideRHPState));
}

describe('EditableCell', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await waitForBatchedUpdates();
    });

    it('is editable in the main pane on a wide screen', async () => {
        // Given a cell in the main pane on a wide screen
        mockedUseResponsiveLayout.mockReturnValue(MAIN_PANE_LAYOUT);

        // When the cell renders
        renderCell();

        // Then the edit pencil is shown
        expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
    });

    it('is editable inside a Wide RHP', async () => {
        // Given a cell on a screen shown in a Wide RHP
        mockedUseResponsiveLayout.mockReturnValue(RHP_LAYOUT);

        // When the cell renders
        renderCell(WIDE_RHP_STATE);

        // Then the edit pencil is shown
        expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
    });

    it('is editable inside a Super Wide RHP', async () => {
        // Given a cell on a screen shown in a Super Wide RHP
        mockedUseResponsiveLayout.mockReturnValue(RHP_LAYOUT);

        // When the cell renders
        renderCell(SUPER_WIDE_RHP_STATE);

        // Then the edit pencil is shown
        expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
    });

    it('is not editable inside a normal RHP', async () => {
        // Given a cell on a screen shown in a normal RHP
        mockedUseResponsiveLayout.mockReturnValue(RHP_LAYOUT);

        // When the cell renders
        renderCell();
        await waitForBatchedUpdates();

        // Then the edit pencil is not shown, because a normal RHP uses the narrow layout
        expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
        expect(screen.getByText('$10.00')).toBeOnTheScreen();
    });

    it('is not editable on a narrow screen', async () => {
        // Given a cell on a narrow screen
        mockedUseResponsiveLayout.mockReturnValue(NARROW_SCREEN_LAYOUT);

        // When the cell renders
        renderCell();
        await waitForBatchedUpdates();

        // Then the edit pencil is not shown
        expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
        expect(screen.getByText('$10.00')).toBeOnTheScreen();
    });

    it('is not editable on a phone in landscape wider than the large-screen breakpoint', async () => {
        // Given a cell in the main pane of a phone browser in landscape, wider than the large-screen breakpoint
        mockedUseResponsiveLayout.mockReturnValue(PHONE_LANDSCAPE_LAYOUT);

        // When the cell renders
        renderCell();
        await waitForBatchedUpdates();

        // Then the edit pencil is not shown, because a phone uses the narrow layout
        expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
    });

    it('is not editable on a phone in landscape inside a Wide RHP', async () => {
        // Given a cell in a Wide RHP on a phone browser in landscape, wider than the large-screen breakpoint
        mockedUseResponsiveLayout.mockReturnValue({...PHONE_LANDSCAPE_LAYOUT, isInNarrowPaneModal: true});

        // When the cell renders
        renderCell(WIDE_RHP_STATE);
        await waitForBatchedUpdates();

        // Then the edit pencil is not shown, because a phone uses the narrow layout even when the route is registered as Wide
        expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
    });

    it('does not re-render in the main pane when the Wide RHP state changes', async () => {
        // Given a cell in the main pane that has finished rendering
        mockedUseResponsiveLayout.mockReturnValue(MAIN_PANE_LAYOUT);
        renderCell();
        await screen.findByTestId('mock-edit-button');
        mockedUseResponsiveLayout.mockClear();

        // When a Wide RHP opens on top of it
        screen.rerender(buildTree({...defaultWideRHPStateContextValue, wideRHPRouteKeys: ['another-route']}));

        // Then the cell does not call useResponsiveLayout again, so it didn't re-render. It only reads the Wide RHP state inside the RHP
        expect(mockedUseResponsiveLayout).not.toHaveBeenCalled();
    });

    it('re-renders inside the RHP when the Wide RHP state changes', async () => {
        // Given a cell on a screen shown in a normal RHP
        mockedUseResponsiveLayout.mockReturnValue(RHP_LAYOUT);
        renderCell();
        await waitForBatchedUpdates();
        expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
        mockedUseResponsiveLayout.mockClear();

        // When that screen is promoted to a Wide RHP
        screen.rerender(buildTree(WIDE_RHP_STATE));

        // Then the cell re-renders and becomes editable
        expect(mockedUseResponsiveLayout).toHaveBeenCalled();
        expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
    });
});
