import useContentHeaderHeight from './useContentHeaderHeight';
import useSafeAreaInsets from './useSafeAreaInsets';
import useStatusRingHeaderLayout from './useStatusRingHeaderLayout';

/**
 * How far below the top of the window a screen's content starts under its header: the top inset and the header, or only
 * the header where it sits inside the top inset next to the status bar (see useTopInsetHeaderStyle).
 */
function useHeaderAreaHeight(): number {
    const {top} = useSafeAreaInsets();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const statusRingHeaderLayout = useStatusRingHeaderLayout();
    return statusRingHeaderLayout?.height ?? top + contentHeaderHeight;
}

export default useHeaderAreaHeight;
