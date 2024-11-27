import useSafeAreaUtils from '@hooks/useSafeAreaUtils';

export default function usePaddingStyle() {
    const {paddingTop} = useSafeAreaUtils();

    return {paddingTop};
}
