import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import type UseLHNEstimatedListSize from './types';

/**
 * This a native specific implementation for FlashList of LHNOptionsList. It calculates estimated visible height and width of the list. It is not the scroll content size. Defining this prop will enable the list to be rendered immediately. Without it, the list first needs to measure its size, leading to a small delay during the first render.
 */
const useLHNEstimatedListSize: UseLHNEstimatedListSize = () => {
    const {windowHeight, windowWidth} = useWindowDimensions();
    const listHeight = windowHeight - variables.bottomTabHeight;

    return {
        height: listHeight,
        width: windowWidth,
    };
};

export default useLHNEstimatedListSize;
