import type {ImageSource} from 'expo-image';
import type {ImageRequireSource, ImageURISource} from 'react-native';

type ImageSourceParam = ImageSource | number | ImageSource[] | Omit<ImageURISource, 'cache'> | ImageRequireSource | undefined;

/**
 * Returns a string key for image recycling in FlashList.
 * Extracts the URI if available, otherwise stringifies the source.
 */
function getImageRecyclingKey(source: ImageSourceParam): string {
    if (!source) {
        return '';
    }

    if (typeof source === 'number') {
        return String(source);
    }

    if (Array.isArray(source)) {
        const firstSource = source.at(0);
        return firstSource ? getImageRecyclingKey(firstSource) : '';
    }

    if (typeof source === 'object' && 'uri' in source && source.uri) {
        return source.uri;
    }

    return JSON.stringify(source);
}

export default getImageRecyclingKey;
