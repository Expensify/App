type ComposerProps = {
    isFullComposerAvailable?: boolean;
    setIsFullComposerAvailable?: (isFullComposerAvailable: boolean) => void;
    maxLines?: number;
    isComposerFullSize?: boolean;
    isDisabled?: boolean;
};

export default ComposerProps;
