import {fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockPopoverPosition = {
    calculatePopoverPosition: () => Promise.resolve({horizontal: 0, vertical: 0, width: 40, height: 40}),
};
const menuItems = [{text: 'Delete', onSelected: () => {}, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}];

jest.mock('@hooks/usePopoverPosition', () => () => mockPopoverPosition);

jest.mock('@components/PopoverMenu', () => {
    const {View: RNView} = jest.requireActual<typeof ReactNative>('react-native');
    function MockPopoverMenu() {
        return <RNView />;
    }
    return MockPopoverMenu;
});

type MockPressableProps = {
    children?: React.ReactNode;
    onPress?: () => void;
    testID?: string;
    accessibilityLabel?: string;
    ref?: React.Ref<{blur: () => void}>;
};

// Records the button's blur in the same list as onIconPress, because the real blur has no observable effect under Jest
const mockCalls: string[] = [];
jest.mock('@components/Pressable/PressableWithoutFeedback', () => {
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    function MockPressable({children, onPress, testID, accessibilityLabel, ref}: MockPressableProps) {
        useImperativeHandle(ref, () => ({blur: () => mockCalls.push('blur')}));
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
                role="button"
            >
                {children}
            </Pressable>
        );
    }
    return MockPressable;
});

describe('ThreeDotsMenu onIconPress', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, initialKeyStates: {[ONYXKEYS.MODAL]: {isVisible: false, willAlertModalBecomeVisible: false}}});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        mockCalls.length = 0;
    });

    it('runs onIconPress before the button gives up focus', async () => {
        // Given a menu whose container needs to hold some state (like a peek) before focus leaves the button
        const onIconPress = jest.fn(() => mockCalls.push('onIconPress'));
        render(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-menu"
                menuItems={menuItems}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                onIconPress={onIconPress}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the button is pressed
        fireEvent.press(screen.getByTestId('three-dots-menu'));
        await waitForBatchedUpdatesWithAct();

        // Then the container's callback ran first, so it can react to the focus loss that follows
        expect(mockCalls).toEqual(['onIconPress', 'blur']);
    });
});
