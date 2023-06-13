import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

function PreRenderer(props) {
    return <BasePreRenderer {...props} />;
}

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
