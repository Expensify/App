import {act, render, renderHook} from '@testing-library/react-native';
import type {ReactElement, ReactNode} from 'react';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MockConfirmModalProps = {
    prompt: ReactNode;
    confirmText?: string;
    cancelText?: string;
    isVisible?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    title?: string;
};

type MockTextLinkProps = {
    children?: ReactNode;
    onPress?: () => void;
    onLongPress?: (event: unknown) => void;
};

type MockReactModule = {
    createElement: (...args: unknown[]) => ReactElement;
};

const mockTranslate = jest.fn((key: string, params?: Record<string, string>) => (params?.workspaceName ? `${key}:${params.workspaceName}` : key));

let mockTextLinkProps: MockTextLinkProps | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: mockTranslate,
}));

jest.mock('@components/ConfirmModal', () => {
    const mockReact: MockReactModule = jest.requireActual('react');
    return ({prompt, confirmText, cancelText, isVisible, onConfirm, onCancel, title}: MockConfirmModalProps) =>
        mockReact.createElement('mock-confirm-modal', {prompt, confirmText, cancelText, isVisible, onConfirm, onCancel, title}, null);
});

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

type HookValue = ReturnType<typeof useCreateEmptyReportConfirmation>;
type HookProps = {
    policyName?: string;
    onCancel?: () => void;
};

type MockConfirmModalElement = ReactElement<MockConfirmModalProps>;

function getModal(hookValue: HookValue): MockConfirmModalElement {
    return hookValue.CreateReportConfirmationModal as MockConfirmModalElement;
}

function getRequiredHandler<T extends (...args: never[]) => unknown>(handler: T | undefined, name: string): T {
    if (!handler) {
        throw new Error(`${name} handler was not provided`);
    }
    return handler;
}

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
    });

    it('modal is hidden by default and opens on demand', () => {
        const onConfirm = jest.fn();
        const {result} = renderHook<HookValue, MockConfirmModalProps>(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        let modal = getModal(result.current);
        expect(modal.props.isVisible).toBe(false);

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        modal = getModal(result.current);
        expect(modal.props.isVisible).toBe(true);
    });

    it('invokes onConfirm and resets state after completion', () => {
        const onConfirm = jest.fn();
        const {result} = renderHook<HookValue, MockConfirmModalProps>(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onConfirm,
            }),
        );

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        let modal = getModal(result.current);
        const confirmHandler = getRequiredHandler(modal.props.onConfirm, 'onConfirm');

        act(() => {
            confirmHandler();
        });

        expect(onConfirm).toHaveBeenCalledTimes(1);

        modal = getModal(result.current);
        expect(modal.props.isVisible).toBe(false);
    });

    it('calls onCancel when cancellation occurs', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();

        const {result} = renderHook<HookValue, MockConfirmModalProps>(() =>
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

        const modal = getModal(result.current);
        const cancelHandler = getRequiredHandler(modal.props.onCancel, 'onCancel');

        act(() => {
            cancelHandler();
        });

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalledTimes(1);

        const updatedModal = getModal(result.current);
        expect(updatedModal.props.isVisible).toBe(false);
    });

    it('navigates to reports search when link in prompt is pressed', () => {
        const onConfirm = jest.fn();
        const {result} = renderHook<HookValue, MockConfirmModalProps>(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName: '',
                onConfirm,
            }),
        );

        const modal = getModal(result.current);
        const {unmount} = render(modal.props.prompt as ReactElement);
        const onPress = mockTextLinkProps?.onPress;

        expect(onPress).toBeDefined();

        act(() => {
            onPress?.();
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(expectedSearchRoute);
        unmount();
    });

    it('calls onCancel when reports link in prompt is pressed', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();

        const {result} = renderHook<HookValue, MockConfirmModalProps>(() =>
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

        const modal = getModal(result.current);
        const {unmount} = render(modal.props.prompt as ReactElement);
        const onPress = mockTextLinkProps?.onPress;

        expect(onPress).toBeDefined();

        act(() => {
            onPress?.();
        });

        expect(onCancel).toHaveBeenCalledTimes(1);
        unmount();
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

        const modal = getModal(result.current);
        const renderedPrompt = render(modal.props.prompt as ReactElement);
        expect(JSON.stringify(renderedPrompt.toJSON())).toContain(`report.newReport.emptyReportConfirmationPrompt:${initialPolicyName}`);
        renderedPrompt.unmount();

        rerender({policyName: '', onCancel});

        const updatedModal = getModal(result.current);
        const renderedPromptAfterClear = render(updatedModal.props.prompt as ReactElement);
        expect(JSON.stringify(renderedPromptAfterClear.toJSON())).toContain(`report.newReport.emptyReportConfirmationPrompt:${initialPolicyName}`);
        renderedPromptAfterClear.unmount();
    });

    it('uses updated workspace name on subsequent opens', () => {
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

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        let modal = getModal(result.current);
        const renderedPrompt = render(modal.props.prompt as ReactElement);
        expect(JSON.stringify(renderedPrompt.toJSON())).toContain(`report.newReport.emptyReportConfirmationPrompt:${initialPolicyName}`);
        renderedPrompt.unmount();

        const cancelHandler = getRequiredHandler(modal.props.onCancel, 'onCancel');
        act(() => {
            cancelHandler();
        });

        rerender({policyName: updatedPolicyName, onCancel});

        act(() => {
            result.current.openCreateReportConfirmation();
        });

        modal = getModal(result.current);
        const renderedPromptAfterUpdate = render(modal.props.prompt as ReactElement);
        expect(JSON.stringify(renderedPromptAfterUpdate.toJSON())).toContain(`report.newReport.emptyReportConfirmationPrompt:${updatedPolicyName}`);
        renderedPromptAfterUpdate.unmount();
    });

    it('falls back to generic workspace name in translations when necessary', () => {
        const onConfirm = jest.fn();
        renderHook<HookValue, MockConfirmModalProps>(() =>
            useCreateEmptyReportConfirmation({
                policyID,
                policyName: '   ',
                onConfirm,
            }),
        );

        expect(mockTranslate).toHaveBeenCalledWith('report.newReport.genericWorkspaceName');
    });
});
