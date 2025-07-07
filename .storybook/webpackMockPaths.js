"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
/* eslint-disable @typescript-eslint/naming-convention */
exports.default = {
    'react-native-config': 'react-web-config',
    'react-native$': 'react-native-web',
    '@react-native-community/netinfo': path_1.default.resolve(__dirname, '../__mocks__/@react-native-community/netinfo.ts'),
    '@react-navigation/native': path_1.default.resolve(__dirname, '../__mocks__/@react-navigation/native'),
};
/* eslint-enable @typescript-eslint/naming-convention */
