import type RNFS from 'react-native-fs';

type RNFSModule = Pick<typeof RNFS, 'exists' | 'unlink' | 'copyFile' | 'DocumentDirectoryPath' | 'writeFile'>;

export default RNFSModule;
