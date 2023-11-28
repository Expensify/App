type AttachmentProps = {
    source: string;
    file: {name: string};
    isAuthTokenRequired?: boolean;
    isFocused?: boolean;
    isUsedInCarousel?: boolean;
    onPress?: () => void;
    onScaleChanged?: (scale?: number) => void;
    isUsedInAttachmentModal?: boolean;
};

export default AttachmentProps;
