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

type TestKeyDownEvent = {
    nativeEvent: KeyboardEvent | {code: string};
    preventDefault: () => void;
};

type CapturedPressableProps = {
    onMouseDown?: (event: TestMouseDownEvent) => void;
    onKeyDown?: (event: TestKeyDownEvent) => void;
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

/** Sends a key down to the button. Unless told otherwise it carries the DOM keyboard event as its native event, the way react-native-web sends it. */
function pressKey(code: string, nativeEvent: TestKeyDownEvent['nativeEvent'] = new KeyboardEvent('keydown', {code})): TestKeyDownEvent {
    const onKeyDown = capturedProps.current?.onKeyDown;
    if (!onKeyDown) {
        throw new Error('PressableWithFeedback did not receive onKeyDown');
    }
    const event: TestKeyDownEvent = {nativeEvent, preventDefault: jest.fn()};
    onKeyDown(event);
    return event;
}

describe('SelectionButton key down', () => {
    beforeEach(() => {
        capturedProps.current = null;
    });

    it('presses on Space with the keyboard event', () => {
        // Given a checkbox on web, where a key down carries the browser's keyboard event as its native event
        const onPress = jest.fn();
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={onPress}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When Space is pressed on it, because that is the key that toggles a checkbox
        const event = pressKey('Space');

        // Then it should be pressed with that keyboard event because press handlers read the Shift key from it,
        // and the default should be prevented because Space would otherwise scroll the page
        expect(onPress).toHaveBeenCalledWith(event.nativeEvent);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('leaves Enter alone by default', () => {
        // Given a checkbox that does not select on Enter, because Enter usually submits the form around it
        const onPress = jest.fn();
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={onPress}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When Enter is pressed on it, as it is when submitting a form while the checkbox has focus
        const event = pressKey('Enter');

        // Then it should not be pressed, and the default should be kept because the form still has to receive the key
        expect(onPress).not.toHaveBeenCalled();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('presses on Enter when it selects on Enter', () => {
        // Given a checkbox that selects on Enter, like a task checkbox where Enter has nothing else to do
        const onPress = jest.fn();
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                shouldSelectOnPressEnter
                onPress={onPress}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When Enter is pressed on it to toggle it from the keyboard
        const event = pressKey('Enter');

        // Then it should be pressed with the keyboard event because Enter stands in for a click on this checkbox
        expect(onPress).toHaveBeenCalledWith(event.nativeEvent);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ignores other keys', () => {
        // Given a checkbox that selects on Enter, so that Space and Enter are the only keys that should activate it
        const onPress = jest.fn();
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                shouldSelectOnPressEnter
                onPress={onPress}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When Tab is pressed on it to move focus away
        const event = pressKey('Tab');

        // Then it should not be pressed, and the default should be kept because Tab has to move focus to the next control
        expect(onPress).not.toHaveBeenCalled();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('presses without an event when the key down is not a DOM event', () => {
        // Given a checkbox whose key downs come from React Native itself, where the native event is plain data and not the browser's keyboard event
        const onPress = jest.fn();
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={onPress}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When Space is pressed on it with such a native event
        const event = pressKey('Space', {code: 'Space'});

        // Then it should still be pressed because Space toggles a checkbox on every platform,
        // but without an event because press handlers expect the browser's keyboard event and this is not one
        expect(onPress).toHaveBeenCalledWith(undefined);
        expect(event.preventDefault).toHaveBeenCalled();
    });
});

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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );
        const event = makeMouseDownEvent(true);
        const focusSpy = jest.spyOn(event.currentTarget, 'focus');
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(false);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('moves focus to the control, blurring the previously focused element', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
        expect(focusSpy).toHaveBeenCalledWith({preventScroll: true});
        expect(document.activeElement).not.toBe(input);
    });

    it('collapses an existing text selection', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );
        const text = document.createElement('p');
        text.textContent = 'some selectable text';
        document.body.append(text);
        attachedNodes.push(text);
        const range = document.createRange();
        range.selectNodeContents(text);
        window.getSelection()?.addRange(range);
        expect(window.getSelection()?.isCollapsed).toBe(false);
        getCapturedMouseDown()(makeMouseDownEvent(true));
        expect(window.getSelection()?.isCollapsed).toBe(true);
    });

    it('skips the focus grab when the consumer already prevented default', () => {
        render(
            <SelectionButton
                role={CONST.ROLE.CHECKBOX}
                isChecked
                onPress={jest.fn()}
                onMouseDown={(e) => e.preventDefault()}
                accessibilityLabel="checkbox"
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );
        const event = makeMouseDownEvent(true);
        getCapturedMouseDown()(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
