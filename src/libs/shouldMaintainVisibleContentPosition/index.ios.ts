import type ShouldMaintainVisibleContentPosition from './types';

function shouldMaintainVisibleContentPosition(isLoading: boolean): ShouldMaintainVisibleContentPosition {
    return !isLoading;
}
export default shouldMaintainVisibleContentPosition;
