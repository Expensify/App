import {renderHook} from '@testing-library/react-native';

import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import useNavigationLayoutPolicy from '@libs/Navigation/AppNavigator/useNavigationLayoutPolicy';

import variables from '@styles/variables';

jest.mock('@hooks/useSafeAreaInsets');
jest.mock('@hooks/useWindowDimensions');

const mockedUseSafeAreaInsets = jest.mocked(useSafeAreaInsets);
const mockedUseWindowDimensions = jest.mocked(useWindowDimensions);
const REQUIRED_WIDE_WIDTH = variables.navigationTabBarSize + variables.sideBarWithLHBWidth + variables.navigationCentralPaneMinWidth;

describe('useNavigationLayoutPolicy', () => {
    beforeEach(() => {
        mockedUseSafeAreaInsets.mockReturnValue({top: 0, right: 0, bottom: 0, left: 0});
    });

    it('updates the mode directly from the current width', () => {
        let windowWidth = REQUIRED_WIDE_WIDTH - 100;
        mockedUseWindowDimensions.mockImplementation(() => ({windowWidth, windowHeight: 700}));
        const {result, rerender} = renderHook(() => useNavigationLayoutPolicy());

        expect(result.current?.mode).toBe('narrow');

        windowWidth = REQUIRED_WIDE_WIDTH + 100;
        rerender({});

        expect(result.current?.mode).toBe('wide');
    });

    it('falls back to narrow immediately when disabled', () => {
        mockedUseWindowDimensions.mockReturnValue({windowWidth: REQUIRED_WIDE_WIDTH + 200, windowHeight: 700});
        const {result, rerender} = renderHook(({isEnabled}: {isEnabled: boolean}) => useNavigationLayoutPolicy(isEnabled), {initialProps: {isEnabled: true}});

        expect(result.current?.mode).toBe('wide');

        rerender({isEnabled: false});

        expect(result.current?.mode).toBe('narrow');
        expect(result.current?.navigationRailWidth).toBe(0);
    });
});
