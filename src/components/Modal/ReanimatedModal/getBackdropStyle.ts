import type {GetBackdropStyle} from './types';

const getBackdropStyle: GetBackdropStyle = (backdropColor, windowWidth, windowHeight) => ({
    width: windowWidth,
    height: windowHeight,
    backgroundColor: backdropColor,
});

export default getBackdropStyle;
