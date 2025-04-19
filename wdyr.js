'use strict';
exports.__esModule = true;

const React = require('react');
const Config = require('react-native-config');

const useWDYR = Config?.default?.USE_WDYR === 'true';

if (useWDYR) {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');

    whyDidYouRender(React.default, {
        trackAllPureComponents: true,
        include: [
            // /.*/,
            // /^Avatar/,
            // /^ReportActionItem/,
            // /^ReportActionItemSingle/,
        ],
        exclude: [
            // /^Screen/
        ],
    });
}
