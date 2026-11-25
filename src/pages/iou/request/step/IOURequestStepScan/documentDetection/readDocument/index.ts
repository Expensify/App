import type {DocumentReader} from './types';

const documentReader: DocumentReader = {
    frameResolution: {width: 640, height: 480},
    maxBend: 0,
    readDocument() {
        'worklet';

        return {corners: null, outline: undefined, toCameraPoint: (point) => point};
    },
};

export default documentReader;
