import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import useSidePane from './useSidePane';
import useWindowDimensions from './useWindowDimensions';

function useThreeDotsAnchorPosition(style: (windowWidth: number) => AnchorPosition) {
    const {windowWidth} = useWindowDimensions();
    const {isPaneHidden} = useSidePane();

    return style(isPaneHidden ? windowWidth : windowWidth - variables.sideBarWidth);
}

export default useThreeDotsAnchorPosition;
