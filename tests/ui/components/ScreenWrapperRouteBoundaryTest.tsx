import * as NativeNavigation from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {NAVIGATION_FOCUS_ROUTE_DATASET_KEY} from '@libs/NavigationFocusManager/constants';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Log');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isHybridApp: () => false,
    },
}));
jest.mock('@react-navigation/native');
jest.mock('@components/LocaleContextProvider', () => {
    const ReactModule = jest.requireActual<typeof React>('react');

    return {
        LocaleContext: ReactModule.createContext({
            translate: () => '',
            numberFormat: () => '',
            getLocalDateFromDatetime: () => new Date(),
            datetimeToRelative: () => '',
            datetimeToCalendarTime: () => '',
            formatPhoneNumber: () => '',
            toLocaleDigit: () => '',
            toLocaleOrdinal: () => '',
            fromLocaleDigit: () => '',
            localeCompare: () => 0,
            formatTravelDate: () => '',
            preferredLocale: undefined,
        }),
        LocaleContextProvider: ({children}: {children: React.ReactNode}) => children,
    };
});

// Force the real web implementation so this test covers the same route-marker path
// used by desktop web and mWeb rather than Jest's default no-op implementation.
jest.mock('@components/FocusTrap/FocusTrapForScreen', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const webFocusTrapForScreen = jest.requireActual<typeof import('@components/FocusTrap/FocusTrapForScreen/index.web')>('@components/FocusTrap/FocusTrapForScreen/index.web');

    return webFocusTrapForScreen;
});

jest.mock('focus-trap-react', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');

    return {
        FocusTrap: ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children),
    };
});

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <LocaleContextProvider>{children}</LocaleContextProvider>
    </OnyxListItemProvider>
);

function getDataSet(nodeProps: unknown): Record<string, string> | undefined {
    if (!nodeProps || typeof nodeProps !== 'object' || !('dataSet' in nodeProps)) {
        return undefined;
    }

    const {dataSet} = nodeProps as {dataSet?: unknown};
    if (!dataSet || typeof dataSet !== 'object') {
        return undefined;
    }

    return dataSet as Record<string, string>;
}

function countRouteBoundaryNodes(tree: unknown, routeKey: string): number {
    if (!tree) {
        return 0;
    }

    if (Array.isArray(tree)) {
        let total = 0;

        for (const child of tree) {
            total += countRouteBoundaryNodes(child, routeKey);
        }

        return total;
    }

    if (typeof tree !== 'object') {
        return 0;
    }

    const node = tree as {props?: unknown; children?: unknown};
    const childNodes: unknown[] = Array.isArray(node.children) ? node.children : [];
    const isRouteBoundary = getDataSet(node.props)?.[NAVIGATION_FOCUS_ROUTE_DATASET_KEY] === routeKey ? 1 : 0;
    let childRouteBoundaryCount = 0;

    for (const child of childNodes) {
        childRouteBoundaryCount += countRouteBoundaryNodes(child, routeKey);
    }

    return isRouteBoundary + childRouteBoundaryCount;
}

describe('ScreenWrapper route boundary forwarding', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: 'workspace-overview-route', name: 'Report'} as never);
        jest.spyOn(NativeNavigation, 'useIsFocused').mockReturnValue(true);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep the current route marker inside the web FocusTrap wrapper without widening the ScreenWrapper host', async () => {
        // Given: ScreenWrapper is rendered through the real web FocusTrapForScreen path
        const {toJSON} = render(
            <ScreenWrapper testID="screen-wrapper">
                <View testID="screen-content" />
            </ScreenWrapper>,
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When: The ScreenWrapperContainer host is resolved by testID
        const screenWrapperHost = screen.getByTestId('screen-wrapper');

        // Then: ScreenWrapperContainer should remain free of the web-only marker
        // while the rendered tree still contains a stamped route boundary for
        // NavigationFocusManager ownership resolution.
        expect(screenWrapperHost.props.dataSet).toBeUndefined();
        expect(countRouteBoundaryNodes(toJSON(), 'workspace-overview-route')).toBe(1);
    });
});
