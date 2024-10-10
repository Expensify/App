import React, {memo} from "react";
import type {CustomRendererProps, TBlock} from "react-native-render-html";
import {useOnyx} from "react-native-onyx";
import ONYXKEYS from "@src/ONYXKEYS";
import ImageRenderer from "./ImageRenderer";

const ImageRendererMemorize  = memo(
    ImageRenderer,
    (prevProps, nextProps) => prevProps.tnode.attributes === nextProps.tnode.attributes && prevProps.user?.shouldUseStagingServer === nextProps.user?.shouldUseStagingServer,
);

function ImageRendererWrapper(props: CustomRendererProps<TBlock>) {
    const [user] = useOnyx(ONYXKEYS.USER);
    return (
        <ImageRendererMemorize
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            user={user}
        />
    );
}

ImageRendererWrapper.displayName = 'ImageRendererWrapper';
export default ImageRendererWrapper;
