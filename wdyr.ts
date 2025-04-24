// Implements Why Did You Render (WDYR) in Dev
import type WhyDidYouRender from '@welldone-software/why-did-you-render';
import React from 'react';
import Config from 'react-native-config';

const useWDYR = Config?.USE_WDYR === 'true';

if (useWDYR) {
    const whyDidYouRender = require<typeof WhyDidYouRender>('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        // Enable tracking in all pure components by default
        trackAllPureComponents: true,

        include: [
            // Uncomment to enable tracking in all components. Must also uncomment /^Screen/ in exclude.
            // /.*/,
            // Uncomment to enable tracking by displayName, e.g.:
            // /^Avatar/,
            // /^ReportActionItem/,
            // /^ReportActionItemSingle/,
        ],

        exclude: [
            // Uncomment to enable tracking in all components
            // /^Screen/
        ],
    });
}
