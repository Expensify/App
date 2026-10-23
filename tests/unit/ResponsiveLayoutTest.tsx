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
        // Given an already mounted wide layout must respond when the window crosses a breakpoint
        const {result, rerender} = renderHook(() => useResponsiveLayout());
        // When the window resizes to either side of the shared breakpoint boundaries
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: width, windowHeight: 820});
        rerender({});

        // Then all layout flags must update together so components do not retain incompatible pane sizes
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
        // Given a short landscape phone is wider than the narrow breakpoint but still has limited vertical space
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 852, windowHeight: 393});
        jest.mocked(isInLandscapeMode).mockReturnValue(true);
        // When the responsive hook classifies that landscape window
        const {result} = renderHook(() => useResponsiveLayout());

        // Then web keeps its phone exception while native follows width breakpoints without changing small-screen onboarding behavior
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
        // Given the keyboard can shrink the usable window without changing the physical screen height
        const {result, rerender} = renderHook(() => useResponsiveLayout());
        expect(result.current.isExtraSmallScreenHeight).toBe(false);

        // When opening the keyboard leaves only a short window for content
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 400});
        rerender({});

        // Then native must adapt to the reduced space while web retains its screen-based height classification
        expect(result.current.isExtraSmallScreenHeight).toBe(platform !== 'web');
    });

    it.each([
        [undefined, false, false],
        [undefined, true, true],
        [CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED, false, true],
        [CONST.MODAL.MODAL_TYPE.CENTERED, false, false],
        [CONST.MODAL.MODAL_TYPE.CENTERED, true, false],
    ] as const)('handles modal type %s inside RHP %s', (activeModalType, isInsideRHP, isNarrow) => {
        // Given a wide window can still contain a narrow RHP, but a centered modal should keep its own layout
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

        // When the hook resolves modal context together with the parent navigator
        const {result} = renderHook(() => useResponsiveLayout(), {wrapper: Wrapper});

        // Then pane-local narrowness must not be mistaken for a narrow window or leak into centered modals
        expect(getParent).toHaveBeenCalledWith(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(result.current).toMatchObject({isSmallScreenWidth: false, isInNarrowPaneModal: isNarrow, shouldUseNarrowLayout: isNarrow});
    });
});
