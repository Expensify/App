import type UseActiveElementRole from './types';

/**
 * Native doesn't have the DOM, so we just return null.
 */
const useActiveElementRole: UseActiveElementRole = () => null;

export default useActiveElementRole;
