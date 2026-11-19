/** Lets receipt screens hear about load problems from the generic image components below them */
import type {ImageLoadStallReason} from '@hooks/useImageLoadStall';

import {createContext} from 'react';

import type {BaseImageProps} from './Image/types';

type ImageLoadComponent = 'ImageWithLoading' | 'ImageView' | 'Lightbox';

type ImageLoadEvent = {
    component: ImageLoadComponent;

    /** The raw URI, which can be a signed link. Use it to tell sources apart, never log it */
    source: string | number | undefined;
} & (
    | {
          type: 'error';

          /** The load had already hit the stall timeout */
          afterTimeout: boolean;
      }
    | {type: 'stall'; reason: ImageLoadStallReason}
    | {type: 'retry'}
    | {type: 'recovered'}
);

type ImageLoadEventReporter = (event: ImageLoadEvent) => void;

/** Receipt screens provide this to log image load problems. Chat images have no provider, so they never reach the logs */
const ImageLoadEventContext = createContext<ImageLoadEventReporter | undefined>(undefined);

function getImageLoadSource(source: BaseImageProps['source']): string | number | undefined {
    if (typeof source === 'number') {
        return source;
    }
    if (!source || Array.isArray(source)) {
        return undefined;
    }
    return 'uri' in source ? source.uri : undefined;
}

export default ImageLoadEventContext;
export {getImageLoadSource};
export type {ImageLoadEvent, ImageLoadEventReporter};
