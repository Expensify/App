import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

const PreRenderer = props => (
    <BasePreRenderer
    // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
