import type useConfirmModal from '@hooks/useConfirmModal';

// Mirrors @components/Modal/Global/ModalContext's ModalActions without importing the real module,
// which pulls in Log/Network/HybridAppModule and is unnecessary for tests that only mock useConfirmModal.
const MockModalActions = {CONFIRM: 'CONFIRM', CLOSE: 'CLOSE'} as const;

type ShowConfirmModal = ReturnType<typeof useConfirmModal>['showConfirmModal'];
type ShowConfirmModalOptions = Parameters<ShowConfirmModal>[0];
type ShowConfirmModalResult = Awaited<ReturnType<ShowConfirmModal>>;

let lastShowConfirmModalOptions: ShowConfirmModalOptions | undefined;
let resolvePendingShowConfirmModal: ((result: ShowConfirmModalResult) => void) | undefined;

const mockShowConfirmModal = jest.fn((options: ShowConfirmModalOptions) => {
    lastShowConfirmModalOptions = options;
    return new Promise<ShowConfirmModalResult>((resolve) => {
        resolvePendingShowConfirmModal = resolve;
    });
});

const mockCloseModal = jest.fn();

/** Call in beforeEach to clear call history and any pending unresolved modal from a previous test. */
function resetMockConfirmModal() {
    mockShowConfirmModal.mockClear();
    mockCloseModal.mockClear();
    lastShowConfirmModalOptions = undefined;
    resolvePendingShowConfirmModal = undefined;
}

/** Type-safe read of an option passed to the most recent showConfirmModal(...) call. */
function getShowConfirmModalOption<K extends keyof ShowConfirmModalOptions>(key: K): ShowConfirmModalOptions[K] | undefined {
    return lastShowConfirmModalOptions?.[key];
}

/** Resolves the promise returned by the most recent showConfirmModal(...) call, simulating the user confirming (default) or cancelling the modal. */
function resolveShowConfirmModal(result: ShowConfirmModalResult = {action: MockModalActions.CONFIRM}) {
    resolvePendingShowConfirmModal?.(result);
}

function createMockUseConfirmModalModule() {
    return {
        __esModule: true,
        default: () => ({showConfirmModal: mockShowConfirmModal, closeModal: mockCloseModal}),
    };
}

function createMockModalContextModule() {
    return {
        __esModule: true,
        ModalActions: MockModalActions,
    };
}

export default createMockUseConfirmModalModule();
export {
    createMockUseConfirmModalModule,
    createMockModalContextModule,
    mockShowConfirmModal,
    mockCloseModal,
    getShowConfirmModalOption,
    resetMockConfirmModal,
    resolveShowConfirmModal,
    MockModalActions,
};
export type {ShowConfirmModalOptions, ShowConfirmModalResult};
