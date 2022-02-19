import React from 'react';
import BasePreRenderer from './BasePreRenderer';

const PreRenderer = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePreRenderer {...props} />
);

PreRenderer.displayName = 'PreRenderer';

export default PreRenderer;
