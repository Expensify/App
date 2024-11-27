import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';

export default function usePaddingStyle() {
    const {paddingTop} = useStyledSafeAreaInsets();

    return {paddingTop};
}
