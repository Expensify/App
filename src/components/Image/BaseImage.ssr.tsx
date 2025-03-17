import React from 'react';
import type {BaseImageProps} from './types';
import WebBaseImage from './WebBaseImage';

/**
 * We treat images exactly the same in SSR as in web, except we use the `source` as `defaultSource`.
 * This will ensure that react-native-web fetches and hydrates the image on the server.
 *
 * More context for why this is needed here: https://github.com/necolas/react-native-web/issues/543#issuecomment-310844971
 */
function BaseImage(props: BaseImageProps) {
    return (
        <WebBaseImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            defaultSource={props.source}
        />
    );
}

export default BaseImage;
