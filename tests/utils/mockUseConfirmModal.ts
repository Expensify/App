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

// The resolver of each id'd promise, so an id-scoped close can answer that specific prompt rather than the one that
// happened to be shown last.
const pendingResolversByID = new Map<string, (result: ShowConfirmModalResult) => void>();

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
        if (resolvePendingShowConfirmModal) {
            pendingResolversByID.set(id, resolvePendingShowConfirmModal);
        }
    }
    return promise;
});

const mockCloseModal = jest.fn();

// Mirrors ModalProvider's id-scoped close: the entry is taken off the stack and its promise is resolved with CLOSE, so
// the caller's own `.then` handler runs exactly as it would in the app.
const mockCloseModalByID = jest.fn((id: string) => {
    const resolvePending = pendingResolversByID.get(id);
    if (!resolvePending) {
        return;
    }
    pendingPromisesByID.delete(id);
    pendingResolversByID.delete(id);
    if (lastPendingID === id) {
        lastPendingID = undefined;
    }
    resolvePending({action: MockModalActions.CLOSE});
});

/** Call in beforeEach to clear call history and any pending unresolved modal from a previous test. */
function resetMockConfirmModal() {
    mockShowConfirmModal.mockClear();
    mockCloseModal.mockClear();
    mockCloseModalByID.mockClear();
    lastShowConfirmModalOptions = undefined;
    resolvePendingShowConfirmModal = undefined;
    lastPendingID = undefined;
    pendingPromisesByID.clear();
    pendingResolversByID.clear();
}

/** Type-safe read of an option passed to the most recent showConfirmModal(...) call. */
function getShowConfirmModalOption<K extends keyof ShowConfirmModalOptions>(key: K): ShowConfirmModalOptions[K] | undefined {
    return lastShowConfirmModalOptions?.[key];
}

/** Resolves the promise returned by the most recent showConfirmModal(...) call, simulating the user confirming (default) or cancelling the modal. */
function resolveShowConfirmModal(result: ShowConfirmModalResult = {action: MockModalActions.CONFIRM}) {
    if (lastPendingID) {
        pendingPromisesByID.delete(lastPendingID);
        pendingResolversByID.delete(lastPendingID);
        lastPendingID = undefined;
    }
    resolvePendingShowConfirmModal?.(result);
}

function createMockUseConfirmModalModule() {
    return {
        __esModule: true,
        default: () => ({showConfirmModal: mockShowConfirmModal, closeModal: mockCloseModal, closeModalByID: mockCloseModalByID}),
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
    mockCloseModalByID,
    getShowConfirmModalOption,
    resetMockConfirmModal,
    resolveShowConfirmModal,
    MockModalActions,
};
export type {ShowConfirmModalOptions, ShowConfirmModalResult};
