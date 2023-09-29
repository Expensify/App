import {Asset} from 'react-native-image-picker';
import {GetImageResolution} from './types';

/**
 * Get image resolution
 * Image object is returned as a result of a user selecting image using the react-native-image-picker
 * Image already has width and height properties coming from library so we just need to return them on native
 * Opposite to web where we need to create a new Image object and get dimensions from it
 *
 */
const getImageResolution: GetImageResolution = (file: Asset | File) => Promise.resolve({width: (file as Asset).width ?? 0, height: (file as Asset).height ?? 0});

export default getImageResolution;
