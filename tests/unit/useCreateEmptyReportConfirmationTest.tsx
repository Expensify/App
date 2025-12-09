import {act, render, renderHook} from '@testing-library/react-native';
import type {ReactElement, ReactNode} from 'react';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MockTextLinkProps = {
    children?: ReactNode;
    onPress?: () => void;
    onLongPress?: (event: unknown) => void;
};

type MockReactModule = {
    createElement: (...args: unknown[]) => ReactElement;
};

const mockTranslate = jest.fn((key: string, params?: Record<string, string>) => (params?.workspaceName ? `${key}:${params.workspaceName}` : key));
const mockShowConfirmModal = jest.fn<Promise<{action: 'CONFIRM' | 'CANCEL'}>, [options: {title?: string; prompt?: ReactNode; confirmText?: string; cancelText?: string}]>();

let mockTextLinkProps: MockTextLinkProps | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: mockTranslate,
}));

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));

jest.mock('@components/Text', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return ({children}: {children?: ReactNode}) => mockReact.createElement('mock-text', null, children);
});

jest.mock('@components/TextLink', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return (props: MockTextLinkProps) => {
        mockTextLinkProps = props;
        const {children, onPress, onLongPress} = props;
        return mockReact.createElement('mock-text-link', {onPress, onLongPress}, children);
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

type HookProps = {
    policyName?: string;
    onCancel?: () => void;
};

const policyID = 'policy-123';
const policyName = 'Engineering Team';

const expectedSearchRoute = ROUTES.SEARCH_ROOT.getRoute({
    query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
});

describe('useCreateEmptyReportConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslate.mockClear();
        mockTextLinkProps = undefined;
        mockShowConfirmModal.mockReturnValue(Promise.resolve({action: 'CONFIRM' as const}));
    });

    it('calls showConfirmModal with correct parameters', () => {
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

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                title: expect.any(String),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                prompt: expect.anything(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                confirmText: expect.any(String),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                cancelText: expect.any(String),
            }),
        );
    });

    it('invokes onConfirm when user confirms', async () => {
        const onConfirm = jest.fn();
        mockShowConfirmModal.mockReturnValue(Promise.resolve({action: 'CONFIRM'}));

        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        await act(async () => {
            result.current.openCreateReportConfirmation();
            await Promise.resolve();
        });

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when user cancels', async () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        mockShowConfirmModal.mockReturnValue(Promise.resolve({action: 'CANCEL'}));

        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
                onCancel,
            }),
        );

        await act(async () => {
            result.current.openCreateReportConfirmation();
            await Promise.resolve();
        });

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('navigates to reports search when link in prompt is pressed', () => {
        const onConfirm = jest.fn();
        const {result} = renderHook(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName: '',
                onConfirm,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        // Get the prompt from the mock call and render it
        const callArgs = mockShowConfirmModal.mock.calls.at(0);
        if (callArgs) {
            const {prompt} = callArgs[0];
            render(prompt as ReactElement);
        }

        const onPress = mockTextLinkProps?.onPress;
        expect(onPress).toBeDefined();

        act(() => {
            onPress?.();
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(expectedSearchRoute);
    });

    it('calls onCancel when reports link in prompt is pressed', () => {
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

        // Get the prompt from the mock call and render it
        const callArgs = mockShowConfirmModal.mock.calls.at(0);
        if (callArgs) {
            const {prompt} = callArgs[0];
            render(prompt as ReactElement);
        }

        const onPress = mockTextLinkProps?.onPress;
        expect(onPress).toBeDefined();

        act(() => {
            onPress?.();
        });

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('retains displayed workspace name while parent clears selection', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        const initialPolicyName = policyName;

        const {result, rerender} = renderHook(
            ({policyName: currentPolicyName, onCancel: currentOnCancel}: HookProps) =>
                useCreateEmptyReportConfirmation({
                    policyID,
                    policyName: currentPolicyName,
                    onConfirm,
                    onCancel: currentOnCancel,
                }),
            {
                initialProps: {
                    policyName: initialPolicyName,
                    onCancel,
                },
            },
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        // Check that translate was called with the initial policy name
        expect(mockTranslate).toHaveBeenCalledWith('report.newReport.emptyReportConfirmationPrompt', {workspaceName: initialPolicyName});

        mockTranslate.mockClear();
        rerender({policyName: '', onCancel});

        // The workspace name should still be cached and not change
        expect(mockTranslate).not.toHaveBeenCalledWith('report.newReport.emptyReportConfirmationPrompt', {workspaceName: ''});
    });

    it('uses updated workspace name on subsequent opens', async () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        const initialPolicyName = policyName;
        const updatedPolicyName = 'Finance Team';

        const {result, rerender} = renderHook(
            ({policyName: currentPolicyName, onCancel: currentOnCancel}: HookProps) =>
                useCreateEmptyReportConfirmation({
                    policyID,
                    policyName: currentPolicyName,
                    onConfirm,
                    onCancel: currentOnCancel,
                }),
            {
                initialProps: {
                    policyName: initialPolicyName,
                    onCancel,
                },
            },
        );

        await act(async () => {
            result.current.openCreateReportConfirmation();
            await Promise.resolve();
        });

        // Check first call used initial policy name
        expect(mockTranslate).toHaveBeenCalledWith('report.newReport.emptyReportConfirmationPrompt', {workspaceName: initialPolicyName});

        mockTranslate.mockClear();
        rerender({policyName: updatedPolicyName, onCancel});

        await act(async () => {
            result.current.openCreateReportConfirmation();
            await Promise.resolve();
        });

        // Check second call used updated policy name
        expect(mockTranslate).toHaveBeenCalledWith('report.newReport.emptyReportConfirmationPrompt', {workspaceName: updatedPolicyName});
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
});
