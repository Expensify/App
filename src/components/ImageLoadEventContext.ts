/** Lets receipt screens log load problems from the generic image components. Without a provider nothing is reported */
import type {ImageLoadStallReason} from '@hooks/useImageLoadStall';

import {createContext} from 'react';

import type {BaseImageProps} from './Image/types';

type ImageLoadComponent = 'ImageWithLoading' | 'ImageView' | 'Lightbox';

type ImageLoadEvent = {
    component: ImageLoadComponent;

    /** Raw URI, possibly a signed link. Never log it */
    source: string | number | undefined;
} & (
    | {
          type: 'error';

          /** The load had already stalled */
          afterTimeout: boolean;
      }
    | {type: 'stall'; reason: ImageLoadStallReason}
    | {type: 'retry'}
    | {type: 'recovered'}
);

type ImageLoadEventReporter = (event: ImageLoadEvent) => void;

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
