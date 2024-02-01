type BaseImageProps = {
    /** Event called with image dimensions when image is loaded */
    onLoad?: (event: {nativeEvent: {width: number; height: number}}) => void;

    /** Whether we should show the top of the image */
    objectPositionTop?: boolean;
};

export type {BaseImageProps};

export default BaseImageProps;
