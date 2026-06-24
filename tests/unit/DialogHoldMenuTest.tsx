import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React, {createContext, useMemo} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {DialogResponse} from '@components/Dialog/actions';
import HoldMenu from '@components/Dialog/HoldMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import CONST from '@src/CONST';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (s: string) => s,
    preferredLocale: 'en',
}));
jest.mock('@hooks/useThemeStyles', () => () => ({pv0: {paddingVertical: 0}, p5: {padding: 20}}));
jest.mock('@libs/Log', () => ({alert: jest.fn(), info: jest.fn(), warn: jest.fn()}));
jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);

const mockHoldMenuSubmit = {onSubmit: jest.fn(), isApprove: false};
jest.mock('@hooks/useHoldMenuSubmit', () => () => mockHoldMenuSubmit);

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
            <View testID="holdmenu-root">{children}</View>
        </SlotsCallbacksContext>
    );
}

function MockTitle({children}: {children: ReactNode}) {
    return <Text testID="holdmenu-title">{children}</Text>;
}

function MockDescription({children}: {children: ReactNode}) {
    return <Text testID="holdmenu-description">{children}</Text>;
}

function MockOption({position, text, onPress}: SlotsOptionProps) {
    return (
        <PressableWithoutFeedback
            testID={`holdmenu-option-${position}`}
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
    Description: MockDescription,
    Option: MockOption,
}));

function withRoot(): void {
    render(<HoldMenu />);
}

function callHoldMenu<TProps extends Record<string, unknown>>(props: TProps): Promise<DialogResponse> {
    let pending: Promise<DialogResponse> | undefined;
    act(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- HoldMenu.call's discriminated-union props don't widen to a generic Record; cast keeps the helper polymorphic.
        pending = (HoldMenu.call as unknown as (p: TProps) => Promise<DialogResponse>)(props);
    });
    if (!pending) {
        throw new Error('HoldMenu.call did not return a promise');
    }
    return pending;
}

beforeEach(() => {
    jest.clearAllMocks();
    mockHoldMenuSubmit.onSubmit = jest.fn();
    mockHoldMenuSubmit.isApprove = false;
});

describe('Dialog/HoldMenu', () => {
    describe('Partial mode (nonHeldAmount present)', () => {
        it('renders two options — partial (primary) and full (secondary)', async () => {
            withRoot();
            const pending = callHoldMenu({
                reportID: 'r1',
                chatReportID: 'c1',
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: undefined,
                methodID: undefined,
                fullAmount: '$100',
                nonHeldAmount: '$60',
            });
            await screen.findByTestId('holdmenu-option-primary');
            screen.getByTestId('holdmenu-option-secondary');
            expect(screen.queryByTestId('holdmenu-option-sole')).toBeNull();
            fireEvent.press(screen.getByTestId('holdmenu-option-secondary'));
            fireEvent.press(screen.getByTestId('holdmenu-option-primary'));
            expect(mockHoldMenuSubmit.onSubmit).toHaveBeenCalledWith(false);
            expect(mockHoldMenuSubmit.onSubmit).toHaveBeenCalledWith(true);
            // eslint-disable-next-line no-void -- expressing throwaway intent without keeping `pending` referenced.
            void pending;
        });

        it('partial-option onPress invokes useHoldMenuSubmit.onSubmit(false)', async () => {
            withRoot();
            const pending = callHoldMenu({
                reportID: 'r1',
                chatReportID: 'c1',
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: undefined,
                methodID: undefined,
                fullAmount: '$100',
                nonHeldAmount: '$60',
            });
            await screen.findByTestId('holdmenu-option-primary');
            fireEvent.press(screen.getByTestId('holdmenu-option-primary'));
            expect(mockHoldMenuSubmit.onSubmit).toHaveBeenCalledWith(false);
            // eslint-disable-next-line no-void -- expressing throwaway intent without keeping `pending` referenced.
            void pending;
        });
    });

    describe('Full-only mode (transactionCount, no nonHeldAmount)', () => {
        it('renders a single sole option and routes onPress to onSubmit(true)', async () => {
            withRoot();
            const pending = callHoldMenu({
                reportID: 'r1',
                chatReportID: 'c1',
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: undefined,
                methodID: undefined,
                fullAmount: '$100',
                transactionCount: 3,
            });
            await screen.findByTestId('holdmenu-option-sole');
            expect(screen.queryByTestId('holdmenu-option-primary')).toBeNull();
            expect(screen.queryByTestId('holdmenu-option-secondary')).toBeNull();
            fireEvent.press(screen.getByTestId('holdmenu-option-sole'));
            expect(mockHoldMenuSubmit.onSubmit).toHaveBeenCalledWith(true);
            // eslint-disable-next-line no-void -- expressing throwaway intent without keeping `pending` referenced.
            void pending;
        });
    });

    describe('Approve variant', () => {
        it('uses approve copy when useHoldMenuSubmit.isApprove is true', async () => {
            mockHoldMenuSubmit.isApprove = true;
            withRoot();
            const pending = callHoldMenu({
                reportID: 'r1',
                chatReportID: 'c1',
                requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                paymentType: undefined,
                methodID: undefined,
                fullAmount: '$100',
                transactionCount: 1,
            });
            await screen.findByTestId('holdmenu-title');
            expect(screen.getByTestId('holdmenu-title').props.children).toBe('iou.confirmApprove');
            // eslint-disable-next-line no-void -- expressing throwaway intent without keeping `pending` referenced.
            void pending;
        });
    });
});
