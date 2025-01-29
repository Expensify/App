import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import type UseLHNEstimatedListSize from './types';

const useLHNEstimatedListSize: UseLHNEstimatedListSize = () => {
    const {windowHeight, windowWidth} = useWindowDimensions();
    const listHeight = windowHeight - variables.bottomTabHeight;

    return {
        height: listHeight,
        width: windowWidth,
    };
};

export default useLHNEstimatedListSize;
