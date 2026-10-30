/**
 * Native has no document to listen to, and nothing anchored to a scrolling page to keep in place, so there is nothing
 * to remeasure.
 */
import type UseRemeasureOnScroll from './types';

const useRemeasureOnScroll: UseRemeasureOnScroll = () => {};

export default useRemeasureOnScroll;
