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

jest.mock('@react-navigation/native');

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

    it('should forward the current route marker to the outer ScreenWrapper host on web', async () => {
        // Given: ScreenWrapper is rendered through the real web FocusTrapForScreen path
        render(
            <ScreenWrapper testID="screen-wrapper">
                <View testID="screen-content" />
            </ScreenWrapper>,
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When: The ScreenWrapperContainer host is resolved by testID
        const screenWrapperHost = screen.getByTestId('screen-wrapper');

        // Then: The outer host should carry the current route marker because
        // NavigationFocusManager later resolves ownership from DOM ancestry.
        expect(screenWrapperHost.props.dataSet).toEqual({
            [NAVIGATION_FOCUS_ROUTE_DATASET_KEY]: 'workspace-overview-route',
        });
    });
});
