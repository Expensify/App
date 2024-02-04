type BackgroundImageProps = {
    /** pointerEvents property to the SVG element */
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';

    /** The width of the image. */
    width: number;

    /** Is the window width narrow, like on a mobile device */
    isSmallScreen?: boolean;

    /** Transition duration in milliseconds */
    transitionDuration: number;
};

export default BackgroundImageProps;
