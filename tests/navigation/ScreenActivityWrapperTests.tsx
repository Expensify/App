import {render, screen} from '@testing-library/react-native';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import useIsScreenCovered from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsScreenCovered';
import useScreenActivityMode from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityMode';

import type {ActivityProps} from 'react';

import React, {useEffect} from 'react';
import {View} from 'react-native';

jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityMode', () => jest.fn());

// The real hook reads the navigation state, which would need a whole navigator around the wrapper. Blurred is the
// only part of that state this harness varies, so the stub reports exactly what it is given.
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsScreenCovered', () => jest.fn());

const mockedUseScreenActivityMode = jest.mocked(useScreenActivityMode);
const mockedUseIsScreenCovered = jest.mocked(useIsScreenCovered);

const effectLog: string[] = [];

function ScreenContent() {
    useEffect(() => {
        effectLog.push('mount');
        return () => {
            effectLog.push('unmount');
        };
    }, []);
    return <View testID="screen-content" />;
}

function renderWrapper(mode: ActivityProps['mode'], isScreenBlurred = false) {
    mockedUseScreenActivityMode.mockReturnValue(mode);
    return render(
        <ScreenActivityWrapper
            isScreenBlurred={isScreenBlurred}
            routeKey="key-1"
            routeName="MiddleScreen"
        >
            <ScreenContent />
        </ScreenActivityWrapper>,
    );
}

/**
 * The painted content of a covered screen has to stay in the tree while leaving the accessibility tree, so it is
 * only reachable through a query that opts into hidden elements.
 */
function queryPaintedContent() {
    return screen.queryByTestId('screen-content', {includeHiddenElements: true});
}

describe('ScreenActivityWrapper', () => {
    beforeEach(() => {
        effectLog.length = 0;
        mockedUseScreenActivityMode.mockReset();
        mockedUseIsScreenCovered.mockReset();
        mockedUseIsScreenCovered.mockImplementation((isScreenBlurred: boolean) => isScreenBlurred);
    });

    it('renders the screen content', () => {
        renderWrapper('visible');

        expect(screen.getByTestId('screen-content')).toBeTruthy();
    });

    it('asks the hook about the mode of this exact screen', () => {
        renderWrapper('visible', true);

        expect(mockedUseScreenActivityMode).toHaveBeenCalledWith({isScreenCovered: true, routeKey: 'key-1', routeName: 'MiddleScreen'});
    });

    it('mounts the effects of a visible screen', () => {
        renderWrapper('visible');

        expect(effectLog).toEqual(['mount']);
    });

    it('unmounts the effects of the screen once the hook reports it as hidden', () => {
        const {rerender} = renderWrapper('visible');

        mockedUseScreenActivityMode.mockReturnValue('hidden');
        rerender(
            <ScreenActivityWrapper
                isScreenBlurred
                routeKey="key-1"
                routeName="MiddleScreen"
            >
                <ScreenContent />
            </ScreenActivityWrapper>,
        );

        expect(effectLog).toEqual(['mount', 'unmount']);
    });

    it('keeps the screen content painted through the custom view wrapper', () => {
        renderWrapper('visible');

        expect(screen.UNSAFE_queryAllByType(CustomViewWrapper)).toHaveLength(1);
    });

    it('asks the covered hook about this exact screen', () => {
        renderWrapper('hidden', true);

        expect(mockedUseIsScreenCovered).toHaveBeenCalledWith(true);
    });

    it('takes the stale content of a covered screen out of the accessibility tree while keeping it painted', () => {
        renderWrapper('hidden', true);

        expect(screen.queryByTestId('screen-content')).toBeNull();
        expect(queryPaintedContent()).not.toBeNull();
    });

    it('marks the painted content inert for as long as the screen is covered', () => {
        renderWrapper('hidden', true);

        expect(screen.UNSAFE_getByType(CustomViewWrapper).props.inert).toBe(true);
    });

    it('leaves the content of the screen the user is looking at reachable', () => {
        renderWrapper('visible');

        expect(screen.queryByTestId('screen-content')).not.toBeNull();
        expect(screen.UNSAFE_getByType(CustomViewWrapper).props.inert).toBe(false);
    });

    it('reveals the content as soon as the screen stops being covered, without waiting for the Activity mode', () => {
        const {rerender} = renderWrapper('hidden', true);

        // The mode still reports hidden here, the way it does until the navigation transition ends.
        rerender(
            <ScreenActivityWrapper
                isScreenBlurred={false}
                routeKey="key-1"
                routeName="MiddleScreen"
            >
                <ScreenContent />
            </ScreenActivityWrapper>,
        );

        expect(screen.queryByTestId('screen-content')).not.toBeNull();
    });
});
