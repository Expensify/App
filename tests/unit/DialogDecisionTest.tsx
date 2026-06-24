import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React, {createContext, useMemo} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {DialogActions} from '@components/Dialog/actions';
import type {DialogResponse} from '@components/Dialog/actions';
import Decision from '@components/Dialog/Decision';
import {ModalContentStateContext} from '@components/Modal/v2/compound/Heading';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (s: string) => s,
    preferredLocale: 'en',
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    pv0: {paddingVertical: 0},
    p5: {padding: 20},
}));
jest.mock('@libs/Log', () => ({alert: jest.fn(), info: jest.fn(), warn: jest.fn()}));

jest.mock('@components/RenderHTML', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- jest.requireActual returns untyped module */
    const ReactActual = jest.requireActual('react');
    const ActualText = jest.requireActual('@components/Text').default;
    return function MockRenderHTML({html}: {html: string}) {
        return ReactActual.createElement(ActualText, {testID: 'decision-html'}, html);
    };
});

type SlotsRootProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children?: ReactNode;
};
type SlotsOptionProps = {
    position: 'primary' | 'secondary' | 'sole';
    text: string;
    onPress: () => void;
};

type SlotsCallbacks = {onOpenChange: (open: boolean) => void};
const SlotsCallbacksContext = createContext<SlotsCallbacks | null>(null);

function MockRoot({isOpen, onOpenChange, children}: SlotsRootProps) {
    const callbacks = useMemo<SlotsCallbacks>(() => ({onOpenChange}), [onOpenChange]);
    if (!isOpen) {
        return null;
    }
    return (
        <SlotsCallbacksContext value={callbacks}>
            <ModalContentStateContext
                value={{
                    titleId: 'mock-title',
                    descriptionId: 'mock-description',
                    contentId: 'mock-content',
                    hasTitle: true,
                    hasDescription: true,
                    registerTitle: () => () => {},
                    registerDescription: () => () => {},
                }}
            >
                <View testID="decision-root">{children}</View>
            </ModalContentStateContext>
        </SlotsCallbacksContext>
    );
}

function MockTitle({children}: {children: ReactNode}) {
    return <Text testID="decision-title">{children}</Text>;
}

function MockDescription({children}: {children: ReactNode}) {
    return <Text testID="decision-description">{children}</Text>;
}

function MockOption({position, text, onPress}: SlotsOptionProps) {
    return (
        <PressableWithoutFeedback
            testID={`decision-option-${position}`}
            accessibilityLabel={text}
            onPress={onPress}
        >
            <Text>{text}</Text>
        </PressableWithoutFeedback>
    );
}

jest.mock('@components/Modal/v2/decision', () => ({
    Root: MockRoot,
    Title: MockTitle,
    Option: MockOption,
    Description: MockDescription,
}));

function withRoot(): void {
    render(<Decision />);
}

function callDecision<TProps extends Record<string, unknown>>(props: TProps): Promise<DialogResponse> {
    let pending: Promise<DialogResponse> | undefined;
    act(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Decision.call's discriminated-union props don't widen to a generic Record; cast keeps the helper polymorphic.
        pending = (Decision.call as unknown as (p: TProps) => Promise<DialogResponse>)(props);
    });
    if (!pending) {
        throw new Error('Decision.call did not return a promise');
    }
    return pending;
}

describe('Dialog/Decision', () => {
    describe('Sole-option mode (no firstOptionText)', () => {
        it('renders only the secondary option and resolves with CLOSE on press', async () => {
            withRoot();
            const pending = callDecision({
                title: 'Heads up',
                secondOptionText: 'Got it',
                secondOptionVariant: 'neutral',
            });
            await screen.findByTestId('decision-option-sole');
            expect(screen.queryByTestId('decision-option-primary')).toBeNull();
            expect(screen.queryByTestId('decision-option-secondary')).toBeNull();
            fireEvent.press(screen.getByTestId('decision-option-sole'));
            const result = await pending;
            expect(result.action).toBe(DialogActions.CLOSE);
        });
    });

    describe('Dual-option mode (firstOptionText present)', () => {
        it('resolves with CONFIRM when the primary option is pressed', async () => {
            withRoot();
            const pending = callDecision({
                title: 'Choose',
                firstOptionText: 'Save',
                firstOptionVariant: 'success',
                secondOptionText: 'Discard',
                secondOptionVariant: 'danger',
            });
            await screen.findByTestId('decision-option-primary');
            fireEvent.press(screen.getByTestId('decision-option-primary'));
            const result = await pending;
            expect(result.action).toBe(DialogActions.CONFIRM);
        });

        it('resolves with CLOSE when the secondary option is pressed', async () => {
            withRoot();
            const pending = callDecision({
                title: 'Choose',
                firstOptionText: 'Save',
                firstOptionVariant: 'success',
                secondOptionText: 'Discard',
                secondOptionVariant: 'danger',
            });
            await screen.findByTestId('decision-option-secondary');
            fireEvent.press(screen.getByTestId('decision-option-secondary'));
            const result = await pending;
            expect(result.action).toBe(DialogActions.CLOSE);
        });
    });

    describe('Prompt rendering — aria-describedby wiring', () => {
        it('wraps RenderHTML in a View whose nativeID matches the Modal Content descriptionId', async () => {
            withRoot();
            const pending = callDecision({
                title: 'Heads up',
                prompt: '<b>Important</b>',
                secondOptionText: 'OK',
                secondOptionVariant: 'neutral',
            });
            await screen.findByTestId('decision-html');
            let node: ReturnType<typeof screen.getByTestId> | null = screen.getByTestId('decision-html');
            while (node && node.props?.nativeID === undefined) {
                node = node.parent ?? null;
            }
            expect(node?.props?.nativeID).toBe('mock-description');
            fireEvent.press(screen.getByTestId('decision-option-sole'));
            await pending;
        });

        it('omits the prompt entirely when none is provided', async () => {
            withRoot();
            const pending = callDecision({
                title: 'Heads up',
                secondOptionText: 'OK',
                secondOptionVariant: 'neutral',
            });
            await screen.findByTestId('decision-option-sole');
            expect(screen.queryByTestId('decision-html')).toBeNull();
            fireEvent.press(screen.getByTestId('decision-option-sole'));
            await pending;
        });
    });
});
