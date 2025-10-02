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
    isConfirmLoading?: boolean;
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
    return ({prompt, confirmText, cancelText, isVisible, onConfirm, onCancel, title, isConfirmLoading}: MockConfirmModalProps) =>
        mockReact.createElement('mock-confirm-modal', {prompt, confirmText, cancelText, isVisible, onConfirm, onCancel, title, isConfirmLoading}, null);
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

function createDeferredPromise<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {promise, resolve, reject};
}

type HookValue = ReturnType<typeof useCreateEmptyReportConfirmation>;

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
    query: buildCannedSearchQuery({groupBy: CONST.SEARCH.GROUP_BY.REPORTS}),
});

describe('useCreateEmptyReportConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslate.mockClear();
        mockTextLinkProps = undefined;
    });

    it('renders hidden modal by default and opens on demand', () => {
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

    it('invokes synchronous onConfirm and resets state after completion', async () => {
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

        await act(async () => {
            await Promise.resolve();
        });

        modal = getModal(result.current);
        expect(modal.props.isConfirmLoading).toBe(false);
        expect(modal.props.isVisible).toBe(false);
    });

    it('handles asynchronous onConfirm and prevents duplicate submissions while loading', async () => {
        const {promise, resolve} = createDeferredPromise<void>();
        const onConfirm = jest.fn().mockReturnValue(promise);

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

        await act(async () => {
            await confirmHandler();
        });

        expect(onConfirm).toHaveBeenCalledTimes(1);

        modal = getModal(result.current);
        expect(modal.props.isConfirmLoading).toBe(true);

        const loadingConfirmHandler = getRequiredHandler(modal.props.onConfirm, 'onConfirm');

        await act(async () => {
            await loadingConfirmHandler();
        });

        expect(onConfirm).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolve();
            await Promise.resolve();
        });

        modal = getModal(result.current);
        expect(modal.props.isConfirmLoading).toBe(false);
        expect(modal.props.isVisible).toBe(false);
    });

    it('calls onCancel when cancellation occurs and not loading', () => {
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

    it('ignores cancel attempts while confirmation is loading', async () => {
        const {promise, resolve} = createDeferredPromise<void>();
        const onConfirm = jest.fn().mockReturnValue(promise);
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

        let modal = getModal(result.current);
        const confirmHandler = getRequiredHandler(modal.props.onConfirm, 'onConfirm');

        await act(async () => {
            await confirmHandler();
        });

        modal = getModal(result.current);
        expect(modal.props.isConfirmLoading).toBe(true);

        const cancelHandler = getRequiredHandler(modal.props.onCancel, 'onCancel');

        act(() => {
            cancelHandler();
        });

        expect(onCancel).not.toHaveBeenCalled();

        await act(async () => {
            resolve();
            await Promise.resolve();
        });

        modal = getModal(result.current);
        expect(modal.props.isConfirmLoading).toBe(false);
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
