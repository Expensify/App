import RNImageManipulator from '@oguzhnatly/react-native-image-manipulator';
import RNFetchBlob from 'rn-fetch-blob';

function imageManipulator(uri, actions, options) {
    return new Promise((resolve) => {
        RNImageManipulator.manipulate(uri, actions, options).then((result) => {
            RNFetchBlob.fs.stat(result.uri.replace('file://', '')).then(({size}) => {
                resolve({...result, size});
            });
        });
    });
}

export default imageManipulator;
