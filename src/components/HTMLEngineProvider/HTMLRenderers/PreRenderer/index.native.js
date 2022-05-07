import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

const PreRenderer = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePreRenderer {...props} />
);

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
