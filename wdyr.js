import React from 'react';
import Config from 'react-native-config';

const useWDYR = Config?.USE_WDYR === 'true';

if (useWDYR) {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
        include: [
            // /^Avatar/,
            // /^ReportActionItem/,
        ],
        exclude: [
            // /^Screen/
        ],
    });
}
