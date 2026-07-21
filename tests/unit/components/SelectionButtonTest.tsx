import {render} from '@testing-library/react-native';

import SelectionButton from '@components/SelectionButton';

import CONST from '@src/CONST';

import React from 'react';

type TestMouseDownEvent = {
    shiftKey: boolean;
    defaultPrevented: boolean;
    preventDefault: () => void;
    stopPropagation: () => void;
    currentTarget: HTMLElement;
};

type CapturedPressableProps = {
    onMouseDown?: (event: TestMouseDownEvent) => void;
};

const capturedProps: {current: CapturedPressableProps | null} = {current: null};
jest.mock('@components/Pressable/PressableWithFeedback', () => ({
    __esModule: true,
    default: (props: CapturedPressableProps) => {
        capturedProps.current = props;
        return null;
    },
}));

jest.mock('@hooks/useTheme', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useStyleUtils', () => ({__esModule: true, default: jest.fn(() => new Proxy({}, {get: () => () => ({})}))}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({Checkmark: () => null, Minus: () => null}))}));

const attachedNodes: HTMLElement[] = [];

function makeMouseDownEvent(shiftKey: boolean): TestMouseDownEvent {
    const currentTarget = document.createElement('button');
    document.body.append(currentTarget);
    attachedNodes.push(currentTarget);
    const event: TestMouseDownEvent = {
        shiftKey,
        defaultPrevented: false,
        preventDefault: () => {
            event.defaultPrevented = true;
        },
        stopPropagation: jest.fn(),
        currentTarget,
    };
    return event;
}

function getCapturedMouseDown(): (event: TestMouseDownEvent) => void {
    const onMouseDown = capturedProps.current?.onMouseDown;
    if (!onMouseDown) {
        throw new Error('PressableWithFeedback did not receive onMouseDown');
    }
    return onMouseDown;
}

describe('SelectionButton shift+mousedown', () => {
    beforeEach(() => {
        capturedProps.current = null;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    });

    afterEach(() => {
        for (const node of attachedNodes) {
            node.remove();
        }
        attachedNodes.length = 0;
    });

    it('prevents the browser default and takes focus when nothing holds it', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
            />,
        );
        const event = makeMouseDownEvent(true);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(true);
        expect(focusSpy).toHaveBeenCalledWith({preventScroll: true});
    });

    it('leaves the event alone without Shift', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
            />,
        );
        const event = makeMouseDownEvent(false);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(false);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('does nothing for disabled controls', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                disabled
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
            />,
        );
        const event = makeMouseDownEvent(true);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(false);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('never steals focus from a focused element', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
            />,
        );
        const input = document.createElement('input');
        document.body.append(input);
        attachedNodes.push(input);
        input.focus();
        const event = makeMouseDownEvent(true);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(true);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('skips the focus grab when the consumer already prevented default', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                onMouseDown={(e) => e.preventDefault()}
                accessibilityLabel="checkbox"
            />,
        );
        const event = makeMouseDownEvent(true);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(true);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('suppresses text selection for radio buttons too', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.RADIO}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="radio"
            />,
        );
        const event = makeMouseDownEvent(true);
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
