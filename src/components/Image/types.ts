type BaseImageProps = {
    /** Event called with image dimensions when image is loaded */
    onLoad?: (event: {nativeEvent: {width: number; height: number}}) => void;
};

export type {BaseImageProps};

export default BaseImageProps;
