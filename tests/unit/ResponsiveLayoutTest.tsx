import {renderHook} from '@testing-library/react-native';

import ModalContext from '@components/Modal/ModalContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeMode from '@libs/isInLandscapeMode';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';
import {Dimensions, Platform} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@libs/isInLandscapeMode', () => jest.fn());

describe.each(['ios', 'android', 'web'] as const)('Responsive layout on %s', (platform) => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 820});
        jest.mocked(isInLandscapeMode).mockReturnValue(false);
        jest.spyOn(Dimensions, 'get').mockReturnValue({width: 1180, height: 820, scale: 1, fontScale: 1});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        [800, true, false, false, false],
        [801, false, true, false, false],
        [1024, false, true, false, false],
        [1025, false, false, true, false],
        [1300, false, false, true, false],
        [1301, false, false, true, true],
    ])('updates breakpoints after resizing to %i', (width, isSmall, isMedium, isLarge, isExtraLarge) => {
        const {result, rerender} = renderHook(() => useResponsiveLayout());
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: width, windowHeight: 820});
        rerender({});

        expect(result.current).toMatchObject({
            shouldUseNarrowLayout: isSmall,
            isSmallScreenWidth: isSmall,
            isMediumScreenWidth: isMedium,
            isLargeScreenWidth: isLarge,
            isExtraLargeScreenWidth: isExtraLarge,
            isInNarrowPaneModal: false,
        });
    });

    it('preserves the phone-landscape exception only on web', () => {
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 852, windowHeight: 393});
        jest.mocked(isInLandscapeMode).mockReturnValue(true);
        const {result} = renderHook(() => useResponsiveLayout());

        expect(result.current).toMatchObject({
            isInLandscapeMode: true,
            isSmallScreen: true,
            isSmallScreenWidth: platform === 'web',
            shouldUseNarrowLayout: platform === 'web',
            isMediumScreenWidth: platform !== 'web',
            onboardingIsMediumOrLargerScreenWidth: false,
        });
    });

    it('uses screen height on web and window height on native after the keyboard reduces the window', () => {
        const {result, rerender} = renderHook(() => useResponsiveLayout());
        expect(result.current.isExtraSmallScreenHeight).toBe(false);

        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 400});
        rerender({});

        expect(result.current.isExtraSmallScreenHeight).toBe(platform !== 'web');
    });

    it.each([
        [undefined, false, false],
        [undefined, true, true],
        [CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED, false, true],
        [CONST.MODAL.MODAL_TYPE.CENTERED, false, false],
        [CONST.MODAL.MODAL_TYPE.CENTERED, true, false],
    ] as const)('handles modal type %s inside RHP %s', (activeModalType, isInsideRHP, isNarrow) => {
        const getParent = jest.fn().mockReturnValue(isInsideRHP ? {} : undefined);
        const navigation = createMock<NavigationProp<ParamListBase>>({getParent});
        const modalContextValue = {activeModalType, default: false};
        function Wrapper({children}: PropsWithChildren) {
            return (
                <NavigationContext.Provider value={navigation}>
                    <ModalContext.Provider value={modalContextValue}>{children}</ModalContext.Provider>
                </NavigationContext.Provider>
            );
        }

        const {result} = renderHook(() => useResponsiveLayout(), {wrapper: Wrapper});

        expect(getParent).toHaveBeenCalledWith(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(result.current).toMatchObject({isSmallScreenWidth: false, isInNarrowPaneModal: isNarrow, shouldUseNarrowLayout: isNarrow});
    });
});
