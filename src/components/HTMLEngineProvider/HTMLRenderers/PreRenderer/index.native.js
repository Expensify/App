import React from 'react';
import htmlRendererPropTypes from '@components/HTMLEngineProvider/HTMLRenderers/htmlRendererPropTypes';
import withLocalize from '@components/withLocalize';
import BasePreRenderer from './BasePreRenderer';

function PreRenderer(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BasePreRenderer {...props} />;
}

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
