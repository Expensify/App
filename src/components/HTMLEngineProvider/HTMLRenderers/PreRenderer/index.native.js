import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef(null);
    }

    render() {
        return (
            <BasePreRenderer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.ref}
            />
        );
    }
}

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
