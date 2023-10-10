import CONST from '../../CONST';
import BoundaryLoaderStyles from './types';

const boundaryLoaderStyles: BoundaryLoaderStyles = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CONST.CHAT_HEADER_LOADER_HEIGHT,
    top: -CONST.CHAT_HEADER_LOADER_HEIGHT,
};

export default boundaryLoaderStyles;
