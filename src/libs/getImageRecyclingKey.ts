import type {ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageURISource} from 'react-native';

type ImageSourceParam = ImageSource | number | ImageSource[] | Omit<ImageURISource, 'cache'> | ImageRequireSource | undefined;

/**
 * Returns a string key for image recycling in FlashList.
 * Extracts the URI if available, otherwise stringifies the source.
 */
function getImageRecyclingKey(source: ImageSourceParam): string | undefined {
    if (!source) {
        return undefined;
    }

    if (typeof source === 'number') {
        return String(source);
    }

    if (Array.isArray(source)) {
        const firstSource = source.at(0);
        return firstSource ? getImageRecyclingKey(firstSource) : undefined;
    }

    if (typeof source === 'object' && 'uri' in source && source.uri) {
        return source.uri;
    }

    return JSON.stringify(source);
}

export default getImageRecyclingKey;
