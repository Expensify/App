import React from 'react';
import CONFIG from './src/CONFIG';

// eslint-disable-next-line no-undef
if (__DEV__ && CONFIG.USE_WDYR) {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
