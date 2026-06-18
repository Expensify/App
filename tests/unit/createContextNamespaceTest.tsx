import Text from '@components/Text';

import createContextNamespace from '@hooks/createContextNamespace';

import type {Context, Ref} from 'react';

import {render, screen} from '@testing-library/react-native';
import React, {use, useImperativeHandle} from 'react';

type FooValue = {label: string};

const createFooNamespace = createContextNamespace('FooParent');
const [FooContext, useFoo] = createFooNamespace<FooValue>('Inner');

function Consumer() {
    const value = useFoo('useFoo');
    return <Text>{value.label}</Text>;
}

type CaptureHandle<T> = {value: T | null};

function CaptureConsumer<T>({context, captureRef}: {context: Context<T | null>; captureRef: Ref<CaptureHandle<T>>}) {
    const value = use(context);
    useImperativeHandle(captureRef, () => ({value}), [value]);
    return null;
}

// Silence the React error-boundary console.error noise from intentional throws.
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
afterAll(() => {
    errorSpy.mockRestore();
});
beforeEach(() => {
    errorSpy.mockClear();
});

describe('createContextNamespace', () => {
    it('returns the context value when the provider is present', () => {
        render(
            <FooContext value={{label: 'hello'}}>
                <Consumer />
            </FooContext>,
        );
        expect(screen.getByText('hello')).toBeTruthy();
    });

    it('throws with a formatted message when the context is null (provider missing)', () => {
        expect(() => render(<Consumer />)).toThrow('useFoo must be used inside <FooParent>.');
    });

    it('uses the supplied consumerName and configured parentName in the error', () => {
        const [, useBar] = createContextNamespace('BarRoot')<FooValue>();
        function CustomConsumer() {
            useBar('useBar');
            return null;
        }
        expect(() => render(<CustomConsumer />)).toThrow('useBar must be used inside <BarRoot>.');
    });

    it('returns the value verbatim including object identity', () => {
        const value: FooValue = {label: 'identity-check'};
        const captureRef = React.createRef<CaptureHandle<FooValue>>();
        render(
            <FooContext value={value}>
                <CaptureConsumer<FooValue>
                    context={FooContext}
                    captureRef={captureRef}
                />
            </FooContext>,
        );
        expect(captureRef.current?.value).toBe(value);
    });

    it('does NOT throw when the value is a falsy-but-non-null primitive (e.g. 0)', () => {
        const [ZeroContext] = createContextNamespace('ZeroRoot')<number>();
        const captureRef = React.createRef<CaptureHandle<number>>();
        render(
            <ZeroContext value={0}>
                <CaptureConsumer<number>
                    context={ZeroContext}
                    captureRef={captureRef}
                />
            </ZeroContext>,
        );
        expect(captureRef.current?.value).toBe(0);
    });

    it('sets a hierarchical displayName when a local name is provided', () => {
        const [Ctx] = createContextNamespace('Parent')<FooValue>('Child');
        expect(Ctx.displayName).toBe('Parent.Child');
    });

    it('falls back to just the parent name when no local name is provided', () => {
        const [Ctx] = createContextNamespace('Solo')<FooValue>();
        expect(Ctx.displayName).toBe('Solo');
    });
});
