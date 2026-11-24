import type {UseRemeasureOnWindowResize} from './types';

/**
 * A native window can't be dragged to a new size. It only changes size on rotation, split view or, on Android, when the
 * keyboard shows, and re-measuring then would move or close a list while its search is being typed in.
 */
const useRemeasureOnWindowResize: UseRemeasureOnWindowResize = () => {};

export default useRemeasureOnWindowResize;
