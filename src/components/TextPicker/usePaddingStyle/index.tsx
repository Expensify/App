import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';

export default function usePaddingStyle() {
    const {paddingTop, paddingBottom} = useStyledSafeAreaInsets();
    return {paddingTop, paddingBottom};
}
