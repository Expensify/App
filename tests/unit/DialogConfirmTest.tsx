import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React, {createContext, use, useMemo} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {DialogActions} from '@components/Dialog/actions';
import type {DialogResponse} from '@components/Dialog/actions';
import Confirm from '@components/Dialog/Confirm';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

jest.mock('@hooks/useActiveElementRole', () => () => undefined);
jest.mock('@hooks/useKeyboardShortcut', () => () => {});
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (s: string) => s,
    preferredLocale: 'en',
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    m5: {margin: 20},
    pv0: {paddingVertical: 0},
}));
jest.mock('@libs/Log', () => ({
    alert: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

type SlotsRootProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: ReactNode;
};
type SlotsActionProps = {
    slot: 'confirm' | 'cancel' | 'dismiss';
    text?: string;
    isLoading?: boolean;
};

type SlotsCallbacks = {confirm: () => void; cancel: () => void};
const SlotsCallbacksContext = createContext<SlotsCallbacks | null>(null);

function MockRoot({isOpen, onConfirm, onCancel, children}: SlotsRootProps) {
    const callbacks = useMemo<SlotsCallbacks>(() => ({confirm: onConfirm, cancel: onCancel}), [onConfirm, onCancel]);
    if (!isOpen) {
        return null;
    }
    return (
        <SlotsCallbacksContext value={callbacks}>
            <View testID="confirm-root">{children}</View>
        </SlotsCallbacksContext>
    );
}

function MockActions({children}: {children: ReactNode}) {
    return <View testID="confirm-actions">{children}</View>;
}

function MockAction({slot, text, isLoading}: SlotsActionProps) {
    const ctx = use(SlotsCallbacksContext);
    const onPress = ctx && (slot === 'confirm' ? ctx.confirm : ctx.cancel);
    return (
        <PressableWithoutFeedback
            testID={`confirm-action-${slot}`}
            accessibilityLabel={text ?? slot}
            onPress={onPress ?? undefined}
            accessibilityState={{disabled: !!isLoading, busy: !!isLoading}}
        >
            <Text>{text ?? slot}</Text>
        </PressableWithoutFeedback>
    );
}

function MockTitle({children}: {children: ReactNode}) {
    return <Text testID="confirm-title">{children}</Text>;
}

function MockDescription({children}: {children: ReactNode}) {
    return <Text testID="confirm-description">{children}</Text>;
}

function MockBanner() {
    return <View testID="confirm-banner" />;
}

function MockIcon() {
    return <View testID="confirm-icon" />;
}

jest.mock('@components/Modal/v2/confirm', () => ({
    Root: MockRoot,
    Actions: MockActions,
    Action: MockAction,
    Title: MockTitle,
    Description: MockDescription,
    Banner: MockBanner,
    Icon: MockIcon,
}));

function withRoot(): void {
    render(<Confirm />);
}

function callConfirm<TProps extends Record<string, unknown>>(props: TProps): Promise<DialogResponse> {
    let pending: Promise<DialogResponse> | undefined;
    act(() => {
        pending = (Confirm.call as (p: TProps) => Promise<DialogResponse>)(props);
    });
    if (!pending) {
        throw new Error('Confirm.call did not return a promise');
    }
    return pending;
}

const flushMicrotasks = async () => {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
};

describe('Dialog/Confirm', () => {
    describe('CONFIRM path', () => {
        it('resolves with CONFIRM when the confirm slot is pressed', async () => {
            withRoot();
            const pending = callConfirm({title: 'Delete?'});
            await screen.findByTestId('confirm-root');

            fireEvent.press(screen.getByTestId('confirm-action-confirm'));
            await flushMicrotasks();

            const result = await pending;
            expect(result).toEqual<DialogResponse>({action: DialogActions.CONFIRM});
        });
    });

    describe('CLOSE path', () => {
        it('resolves with CLOSE when the cancel slot is pressed', async () => {
            withRoot();
            const pending = callConfirm({title: 'Delete?', cancel: {text: 'Nope'}});
            await screen.findByTestId('confirm-root');

            fireEvent.press(screen.getByTestId('confirm-action-cancel'));
            await flushMicrotasks();

            const result = await pending;
            expect(result).toEqual<DialogResponse>({action: DialogActions.CLOSE});
        });

        it('resolves with CLOSE when Confirm.end is invoked from the caller', async () => {
            withRoot();
            const pending = callConfirm({title: 'Delete?'});
            await screen.findByTestId('confirm-root');

            act(() => {
                Confirm.end(pending, {action: DialogActions.CLOSE});
            });
            await flushMicrotasks();

            const result = await pending;
            expect(result).toEqual<DialogResponse>({action: DialogActions.CLOSE});
        });
    });

    describe('mutationFn (async submit)', () => {
        it('keeps the dialog open while the mutation is pending and resolves when the handler ends the call', async () => {
            withRoot();

            let resolveMutation: ((endCall: (r: DialogResponse) => void) => void) | undefined;
            const mutationFn = jest.fn(async (call: {end: (r: DialogResponse) => void}) => {
                await new Promise<void>((resolve) => {
                    resolveMutation = () => {
                        call.end({action: DialogActions.CONFIRM});
                        resolve();
                    };
                });
            });

            const pending = callConfirm({title: 'Pay?', onConfirm: mutationFn});
            await screen.findByTestId('confirm-root');

            fireEvent.press(screen.getByTestId('confirm-action-confirm'));

            expect(mutationFn).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-root')).toBeTruthy();

            await act(async () => {
                resolveMutation?.(() => undefined);
                await Promise.resolve();
                await Promise.resolve();
            });
            await flushMicrotasks();

            const result = await pending;
            expect(result).toEqual<DialogResponse>({action: DialogActions.CONFIRM});
        });

        it('resolves with ERROR when onConfirm rejects', async () => {
            withRoot();

            const boom = new Error('mutationFn rejected');
            const mutationFn = jest.fn(async () => {
                throw boom;
            });

            const pending = callConfirm({title: 'Pay?', onConfirm: mutationFn});
            await screen.findByTestId('confirm-root');

            fireEvent.press(screen.getByTestId('confirm-action-confirm'));
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();
            });
            await flushMicrotasks();

            const result = await pending;
            expect(mutationFn).toHaveBeenCalledTimes(1);
            expect(result).toEqual<DialogResponse>({action: DialogActions.ERROR});
        });
    });

    describe('Stacking', () => {
        it('runs multiple concurrent calls without cross-resolving', async () => {
            withRoot();

            const first = callConfirm({title: 'First'});
            const second = callConfirm({title: 'Second'});

            await waitFor(() => {
                expect(screen.getAllByTestId('confirm-root').length).toBeGreaterThanOrEqual(2);
            });

            act(() => {
                Confirm.end(first, {action: DialogActions.CLOSE});
            });
            act(() => {
                Confirm.end(second, {action: DialogActions.CONFIRM});
            });
            await flushMicrotasks();

            await expect(first).resolves.toEqual<DialogResponse>({action: DialogActions.CLOSE});
            await expect(second).resolves.toEqual<DialogResponse>({action: DialogActions.CONFIRM});
        });
    });

    describe('Render content', () => {
        it('renders the title, prompt, and submit/cancel labels supplied via props', async () => {
            withRoot();
            const pending = callConfirm({
                title: 'Title-A',
                prompt: 'Prompt-A',
                submit: {text: 'Submit-A', variant: 'danger'},
                cancel: {text: 'Cancel-A'},
            });
            await screen.findByTestId('confirm-root');

            expect(screen.getByText('Title-A')).toBeTruthy();
            expect(screen.getByText('Prompt-A')).toBeTruthy();
            expect(screen.getByText('Submit-A')).toBeTruthy();
            expect(screen.getByText('Cancel-A')).toBeTruthy();

            act(() => {
                Confirm.end(pending, {action: DialogActions.CLOSE});
            });
            await flushMicrotasks();
        });
    });
});
