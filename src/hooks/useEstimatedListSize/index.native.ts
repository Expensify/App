import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import type UseEstimatedListSize from './types';

const useEstimatedListSize: UseEstimatedListSize = () => {
    const {windowHeight, windowWidth} = useWindowDimensions();
    const listHeight = windowHeight - variables.bottomTabHeight;

    return {
        height: listHeight,
        width: windowWidth,
    };
};

export default useEstimatedListSize;
