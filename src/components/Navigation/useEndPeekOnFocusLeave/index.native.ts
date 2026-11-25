import type UseEndPeekOnFocusLeave from './types';

/** Only the wide web layout has a surface that peeks on hover, and focus moving across the page is a DOM event, so there is nothing to listen to here. */
const useEndPeekOnFocusLeave: UseEndPeekOnFocusLeave = () => {};

export default useEndPeekOnFocusLeave;
