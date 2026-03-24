import {ImageManipulator} from 'expo-image-manipulator';
import {Platform} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import ImageSize from 'react-native-image-size';
import Log from '@libs/Log';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage} from './types';

/**
 * Crops and rotates the image on ios/android.
 * On iOS, falls back to the original unprocessed image if manipulation fails
 * (e.g. CGContext allocation failure on 48MP photos).
 */
const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve, reject) => {
        const format = getSaveFormat(options.type);
        const context = ImageManipulator.manipulate(uri);
        for (const action of actions) {
            if ('crop' in action) {
                context.crop(action.crop);
            } else if ('rotate' in action) {
                context.rotate(action.rotate);
            }
        }
        context
            .renderAsync()
            .then((imageRef) => imageRef.saveAsync({compress: options.compress, format}))
            // We need to remove the base64 value from the result, as it is causing crashes on Release builds.
            // More info: https://github.com/Expensify/App/issues/37963#issuecomment-1989260033
            .then(({base64, ...result}) => {
                RNFetchBlob.fs
                    .stat(result.uri.replace('file://', ''))
                    .then(({size}) => {
                        resolve({
                            ...result,
                            size,
                            type: options.type || 'image/jpeg',
                            name: options.name || 'fileName.jpg',
                        });
                    })
                    .catch(reject);
            })
            .catch((error) => {
                if (Platform.OS !== 'ios') {
                    reject(error);
                    return;
                }

                Log.warn('Error cropping/rotating image, falling back to original', {error: error instanceof Error ? error.message : String(error)});
                const filePath = uri.replace('file://', '');
                ImageSize.getSize(uri)
                    .then(({width, height}) => {
                        RNFetchBlob.fs
                            .stat(filePath)
                            .then(({size}) => {
                                resolve({
                                    uri,
                                    width: width ?? 0,
                                    height: height ?? 0,
                                    size,
                                    type: options.type || 'image/jpeg',
                                    name: options.name || 'fileName.jpg',
                                });
                            })
                            .catch(reject);
                    })
                    .catch(() => {
                        RNFetchBlob.fs
                            .stat(filePath)
                            .then(({size}) => {
                                resolve({
                                    uri,
                                    width: 0,
                                    height: 0,
                                    size,
                                    type: options.type || 'image/jpeg',
                                    name: options.name || 'fileName.jpg',
                                });
                            })
                            .catch(reject);
                    });
            });
    });

export default cropOrRotateImage;
