import type UseContactPermissionModalParams from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useContactPermissionModal(params: UseContactPermissionModalParams) {
    // Contact import is only available on native platforms, so this hook is a no-op on web.
}

export default useContactPermissionModal;
