import {renderHook} from '@testing-library/react-native';

import {useWideRHPState} from '@components/WideRHPContextProvider';
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import useRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions';

import CONST from '@src/CONST';

import {StyleSheet} from 'react-native';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPState: jest.fn(),
}));

describe('Native RHP layout', () => {
    beforeEach(() => {
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 820});
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(useWideRHPState).mockReturnValue({...defaultWideRHPStateContextValue, superWideRHPRouteKeys: ['expense'], wideRHPRouteKeys: ['transaction']});
    });

    it('keeps the transaction narrower than its underlying expense report', () => {
        const {result} = renderHook(() => useModalStackScreenOptions());
        const expense = result.current({route: {key: 'expense', name: 'expense'}});
        const transaction = result.current({route: {key: 'transaction', name: 'transaction'}});
        const detail = result.current({route: {key: 'detail', name: 'detail'}});

        expect(StyleSheet.flatten(expense.native?.contentStyle)).toMatchObject({width: 1033, alignSelf: 'flex-end'});
        expect(StyleSheet.flatten(transaction.native?.contentStyle)).toMatchObject({width: 840, alignSelf: 'flex-end'});
        expect(StyleSheet.flatten(detail.native?.contentStyle)).toMatchObject({width: 375, alignSelf: 'flex-end'});
    });

    it('retains the base scene and contains inner modals within the RHP host', () => {
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), inner: useRHPScreenOptions()}));
        expect(result.current.root.rightModalNavigator.native?.presentation).toBe('transparentModal');
        expect(result.current.inner.native?.presentation).toBe('containedTransparentModal');
    });

    it('lets narrow screens fill the native stack', () => {
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        const {result} = renderHook(() => ({options: useModalStackScreenOptions(), inner: useRHPScreenOptions()}));
        const transaction = result.current.options({route: {key: 'transaction', name: 'transaction'}});

        expect(StyleSheet.flatten(transaction.native?.contentStyle)?.width).toBeUndefined();
        expect(result.current.inner.native?.presentation).toBeUndefined();
    });
});
