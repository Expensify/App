import {render} from '@testing-library/react-native';

import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import type {ActivityProps} from 'react';

import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import {Activity, StrictMode} from 'react';

// The live-markdown patch registers the parser worklet in useInsertionEffect, so the parser id the native view renders
// with stays registered under StrictMode and while the input's <Activity> is hidden.

jest.unmock('@expensify/react-native-live-markdown');

const registeredParserIds = new Set<number>();

// Jest does not run the worklets Babel plugin, so the hash MarkdownTextInput checks for has to be set by hand.
// eslint-disable-next-line @typescript-eslint/naming-convention
const parser: MarkdownTextInputProps['parser'] = Object.assign(() => [], {__workletHash: 1});

function Screen({mode, isInputMounted}: {mode: ActivityProps['mode']; isInputMounted: boolean}) {
    return (
        <StrictMode>
            <Activity mode={mode}>{isInputMounted ? <MarkdownTextInput parser={parser} /> : null}</Activity>
        </StrictMode>
    );
}

function getRenderedParserId(root: ReturnType<typeof render>['UNSAFE_root']): unknown {
    const parserId: unknown = root.findAll((node) => node.props.parserId !== undefined).at(0)?.props.parserId;
    expect(parserId).toEqual(expect.any(Number));
    return parserId;
}

beforeEach(() => {
    registeredParserIds.clear();
    global.jsi_setMarkdownRuntime = jest.fn();
    global.jsi_registerMarkdownWorklet = jest.fn((parserId: number) => registeredParserIds.add(parserId));
    global.jsi_unregisterMarkdownWorklet = jest.fn((parserId: number) => registeredParserIds.delete(parserId));
});

describe('MarkdownTextInput parser registration', () => {
    it('keeps the rendered parser id registered under StrictMode', () => {
        const {UNSAFE_root: root} = render(
            <Screen
                mode="visible"
                isInputMounted
            />,
        );

        expect([...registeredParserIds]).toStrictEqual([getRenderedParserId(root)]);
    });

    it('keeps the rendered parser id registered while the Activity is hidden and after it is shown again', () => {
        const {UNSAFE_root: root, rerender} = render(
            <Screen
                mode="visible"
                isInputMounted
            />,
        );

        rerender(
            <Screen
                mode="hidden"
                isInputMounted
            />,
        );
        expect([...registeredParserIds]).toStrictEqual([getRenderedParserId(root)]);

        rerender(
            <Screen
                mode="visible"
                isInputMounted
            />,
        );
        expect([...registeredParserIds]).toStrictEqual([getRenderedParserId(root)]);
    });

    it('unregisters the parser when the input is removed while the Activity is hidden', () => {
        const {rerender} = render(
            <Screen
                mode="visible"
                isInputMounted
            />,
        );
        rerender(
            <Screen
                mode="hidden"
                isInputMounted
            />,
        );

        rerender(
            <Screen
                mode="hidden"
                isInputMounted={false}
            />,
        );

        expect(registeredParserIds.size).toBe(0);
    });
});
