import type UseDialogContainerFocus from './types';

/**
 * No-op on native — dialog focus is only needed for web screen readers.
 */
const useDialogContainerFocus: UseDialogContainerFocus = () => {};

export default useDialogContainerFocus;
