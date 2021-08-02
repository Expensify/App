// Implements Why Did You Render (WDYR) in Dev

import React from 'react';
import Config from 'react-native-config';
import lodashGet from 'lodash/get';

const useWDYR = lodashGet(Config, 'USE_WDYR') === 'true';

if (useWDYR) {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        // Include and exclude components to be tracked by their displayName here
        include: [
            /^Avatar/,
            /^ReportActionItem/,
            /^ReportActionItemSingle/,
        ],
        exclude: [],
    });
}
