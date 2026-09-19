import type useConfirmModal from '@hooks/useConfirmModal';

// Mirrors @components/Modal/Global/ModalContext's ModalActions without importing the real module,
// which pulls in Log/Network/HybridAppModule and is unnecessary for tests that only mock useConfirmModal.
const MockModalActions = {CONFIRM: 'CONFIRM', CLOSE: 'CLOSE'} as const;

type ShowConfirmModal = ReturnType<typeof useConfirmModal>['showConfirmModal'];
type ShowConfirmModalOptions = Parameters<ShowConfirmModal>[0];
type ShowConfirmModalResult = Awaited<ReturnType<ShowConfirmModal>>;

let lastShowConfirmModalOptions: ShowConfirmModalOptions | undefined;
let resolvePendingShowConfirmModal: ((result: ShowConfirmModalResult) => void) | undefined;
let lastPendingID: string | undefined;

// Mirrors ModalProvider's `id` handling: while a prompt shown under an id is still unanswered, a repeat call for that
// same id is handed back the promise the first call got instead of a new one, so every caller's handler runs on the
// single answer the user gives.
const pendingPromisesByID = new Map<string, Promise<ShowConfirmModalResult>>();

const mockShowConfirmModal = jest.fn((options: ShowConfirmModalOptions) => {
    lastShowConfirmModalOptions = options;

    const {id} = options;
    const alreadyPending = id ? pendingPromisesByID.get(id) : undefined;
    if (alreadyPending) {
        return alreadyPending;
    }

    const promise = new Promise<ShowConfirmModalResult>((resolve) => {
        resolvePendingShowConfirmModal = resolve;
    });
    lastPendingID = id;
    if (id) {
        pendingPromisesByID.set(id, promise);
    }
    return promise;
});

const mockCloseModal = jest.fn();

/** Call in beforeEach to clear call history and any pending unresolved modal from a previous test. */
function resetMockConfirmModal() {
    mockShowConfirmModal.mockClear();
    mockCloseModal.mockClear();
    lastShowConfirmModalOptions = undefined;
    resolvePendingShowConfirmModal = undefined;
    lastPendingID = undefined;
    pendingPromisesByID.clear();
}

/** Type-safe read of an option passed to the most recent showConfirmModal(...) call. */
function getShowConfirmModalOption<K extends keyof ShowConfirmModalOptions>(key: K): ShowConfirmModalOptions[K] | undefined {
    return lastShowConfirmModalOptions?.[key];
}

/** Resolves the promise returned by the most recent showConfirmModal(...) call, simulating the user confirming (default) or cancelling the modal. */
function resolveShowConfirmModal(result: ShowConfirmModalResult = {action: MockModalActions.CONFIRM}) {
    if (lastPendingID) {
        pendingPromisesByID.delete(lastPendingID);
        lastPendingID = undefined;
    }
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
