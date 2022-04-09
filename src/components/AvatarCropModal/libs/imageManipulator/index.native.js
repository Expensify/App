import RNImageManipulator from '@oguzhnatly/react-native-image-manipulator';
import RNFetchBlob from 'rn-fetch-blob';

function imageManipulator(uri, actions, a) {
    return new Promise((resolve) => {
        RNImageManipulator.manipulate(uri, actions, a).then((result) => {
            RNFetchBlob.fs.stat(result.uri.replace('file://', '')).then(({size}) => {
                resolve({...result, size});
            });
        });
    });
}

export default imageManipulator;
