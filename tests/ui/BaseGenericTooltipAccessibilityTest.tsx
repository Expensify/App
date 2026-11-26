import {fireEvent, render, screen} from '@testing-library/react-native';

import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import NativeBaseGenericTooltip from '@components/Tooltip/BaseGenericTooltip';
import type * as WebBaseGenericTooltipModule from '@components/Tooltip/BaseGenericTooltip/index';
import type {BaseGenericTooltipProps} from '@components/Tooltip/BaseGenericTooltip/types';

import CONST from '@src/CONST';

import type * as ReactDOMModule from 'react-dom';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

// The web tooltip portals into document.body, which the native test renderer can't host, so it renders in place instead.
jest.mock('react-dom', () => ({
    ...jest.requireActual<typeof ReactDOMModule>('react-dom'),
    createPortal: (children: React.ReactNode) => children,
}));

const WebBaseGenericTooltip = jest.requireActual<typeof WebBaseGenericTooltipModule>('@components/Tooltip/BaseGenericTooltip/index.tsx').default;

const TOOLTIP_TEXT = 'Get started here';
const CLOSE_LABEL = 'No thanks';

const onClose = jest.fn();

const TOOLTIP_PROPS: Omit<BaseGenericTooltipProps, 'animation'> = {
    windowWidth: 400,
    xOffset: 0,
    yOffset: 0,
    targetWidth: 100,
    targetHeight: 40,
    isEducationTooltip: true,
    onTooltipPress: jest.fn(),
    // The same shape as the first-session product training tooltip: its text and a close button.
    renderTooltipContent: () => (
        <View>
            <Text>{TOOLTIP_TEXT}</Text>
            <PressableWithoutFeedback
                accessibilityLabel={CLOSE_LABEL}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                onPress={onClose}
            />
        </View>
    ),
};

// The rendered tooltip only reads how far its show animation got, so a fully shown value is enough.
function TooltipAtFullSize({Tooltip}: {Tooltip: React.ComponentType<BaseGenericTooltipProps>}) {
    const animation = useSharedValue(1);
    return (
        <Tooltip
            // eslint-disable-next-line react/jsx-props-no-spreading -- every case renders the same tooltip, only the platform differs
            {...TOOLTIP_PROPS}
            animation={animation}
        />
    );
}

function getTooltipWrappers() {
    return screen.root.findAll((node) => typeof node.type === 'string' && node.props.role === CONST.ROLE.TOOLTIP);
}

// The web tooltip measures itself with the DOM API in a layout effect, which the mocked native View doesn't have.
beforeAll(() => {
    Reflect.defineProperty(View.prototype, 'getBoundingClientRect', {value: () => ({width: 100, height: 40}), configurable: true});
});
afterAll(() => {
    Reflect.deleteProperty(View.prototype, 'getBoundingClientRect');
});

describe.each([
    ['native', NativeBaseGenericTooltip],
    ['web', WebBaseGenericTooltip],
])('BaseGenericTooltip on %s', (_platform, BaseGenericTooltip) => {
    beforeEach(() => {
        onClose.mockClear();
    });

    it('lets a screen reader reach the tooltip text and its close button on their own', () => {
        // Given the first-session tooltip, with its text and a close button
        render(
            <PortalProvider>
                <TooltipAtFullSize Tooltip={BaseGenericTooltip} />
            </PortalProvider>,
        );

        // Then nothing is named "tooltip", because the role is announced on its own and a label made of it hides the real text
        expect(screen.queryByLabelText(CONST.ROLE.TOOLTIP)).toBeNull();

        // And the pressable wrapper is not one accessible element, since on iOS that would hide the text and the close button inside it
        const wrappers = getTooltipWrappers();
        expect(wrappers).toHaveLength(1);
        expect(wrappers.at(0)?.props.accessible).toBe(false);
        expect(screen.getByText(TOOLTIP_TEXT)).toBeOnTheScreen();

        // When the close button is activated
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: CLOSE_LABEL}));

        // Then the tooltip gets dismissed
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
