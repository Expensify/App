import path from 'path';

/* eslint-disable @typescript-eslint/naming-convention */
export default {
    'react-native-config': 'react-web-config',
    'react-native$': 'react-native-web',
    '@react-native-community/netinfo': path.resolve(__dirname, '../__mocks__/@react-native-community/netinfo.ts'),
    '@react-navigation/native': path.resolve(__dirname, '../__mocks__/@react-navigation/native'),
    '@libs/TransactionPreviewUtils': path.resolve(__dirname, '../src/libs/__mocks__/TransactionPreviewUtils.ts'),
};
/* eslint-enable @typescript-eslint/naming-convention */
