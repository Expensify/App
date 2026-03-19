import {act, renderHook} from '@testing-library/react-native';
import type {ReactElement, ReactNode} from 'react';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';

type ShowConfirmModalOptions = {
    prompt?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    title?: string;
};

type ModalResult = {action: string};

type MockReactModule = {
    createElement: (...args: unknown[]) => ReactElement;
};

let lastShowConfirmModalOptions: ShowConfirmModalOptions | undefined;
let resolveModalPromise: ((result: ModalResult) => void) | undefined;

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: jest.fn((options: ShowConfirmModalOptions) => {
        lastShowConfirmModalOptions = options;
        return new Promise<ModalResult>((resolve) => {
            resolveModalPromise = resolve;
        });
    }),
}));

const mockTranslate = jest.fn((key: string, params?: Record<string, string>) => (params?.workspaceName ? `${key}:${params.workspaceName}` : key));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: mockTranslate,
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    gap4: {},
}));

jest.mock('@components/CheckboxWithLabel', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return (props: {accessibilityLabel: string; label: string; isChecked: boolean; onInputChange: (value: boolean) => void}) =>
        mockReact.createElement('mock-checkbox', {accessibilityLabel: props.accessibilityLabel});
});

jest.mock('@components/Text', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return ({children}: {children?: ReactNode}) => mockReact.createElement('mock-text', null, children);
});

jest.mock('@components/TextLink', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return ({children}: {children?: ReactNode}) => mockReact.createElement('mock-text-link', null, children);
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const policyID = 'policy-123';
const policyName = 'Engineering Team';

describe('useCreateEmptyReportConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslate.mockClear();
        lastShowConfirmModalOptions = undefined;
        resolveModalPromise = undefined;
    });

    it('calls showConfirmModal when openCreateReportConfirmation is invoked', () => {
        const onConfirm = jest.fn();
        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        expect(lastShowConfirmModalOptions).toBeDefined();
        expect(lastShowConfirmModalOptions?.confirmText).toBe('report.newReport.createReport');
        expect(lastShowConfirmModalOptions?.cancelText).toBe('common.cancel');
    });

    it('invokes onConfirm when modal resolves with CONFIRM', async () => {
        const onConfirm = jest.fn();
        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        await act(async () => {
            resolveModalPromise?.({action: 'CONFIRM'});
        });

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(false);
    });

    it('calls onCancel when modal resolves with CLOSE', async () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();

        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
                onCancel,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        await act(async () => {
            resolveModalPromise?.({action: 'CLOSE'});
        });

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('falls back to generic workspace name in translations when necessary', () => {
        const onConfirm = jest.fn();
        renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName: '   ',
                onConfirm,
            }),
        );

        expect(mockTranslate).toHaveBeenCalledWith('report.newReport.genericWorkspaceName');
    });

    it('does not call onCancel when not provided and modal is closed', async () => {
        const onConfirm = jest.fn();
        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        await act(async () => {
            resolveModalPromise?.({action: 'CLOSE'});
        });

        expect(onConfirm).not.toHaveBeenCalled();
    });
});
