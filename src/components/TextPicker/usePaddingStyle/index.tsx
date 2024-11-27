import useSafeAreaUtils from '@hooks/useSafeAreaUtils';

export default function usePaddingStyle() {
    const {paddingTop, paddingBottom} = useSafeAreaUtils();
    return {paddingTop, paddingBottom};
}
