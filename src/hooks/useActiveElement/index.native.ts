import UseActiveElement from './types';

/**
 * Native doesn't have the DOM, so we just return null.
 */
const useActiveElement: UseActiveElement = () => null;

export default useActiveElement;
