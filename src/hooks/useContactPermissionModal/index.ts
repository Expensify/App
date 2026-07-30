import type UseContactPermissionModalParams from './types';

// Contact import is only available on native platforms, so this hook is a no-op on web.
const useContactPermissionModal: (params: UseContactPermissionModalParams) => void = () => {};
export default useContactPermissionModal;
