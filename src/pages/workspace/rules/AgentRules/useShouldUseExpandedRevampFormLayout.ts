import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

function useShouldUseExpandedRevampFormLayout(): boolean {
    const isInLandscapeMode = useIsInLandscapeMode();

    return !isInLandscapeMode;
}

export default useShouldUseExpandedRevampFormLayout;
