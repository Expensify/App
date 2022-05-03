import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.wheelEvent = this.wheelEvent.bind(this);
        this.ref = React.createRef(null);
    }

    componentDidMount() {
        this.ref.current
            .getScrollableNode()
            .addEventListener('wheel', this.wheelEvent);
    }

    componentWillUnmount() {
        this.ref.getScrollableNode()
            .removeEventListener('wheel', this.wheelEvent);
    }

    wheelEvent(event) {
        const node = this.ref.current.getScrollableNode();
        const checkOverflow = (node.scrollHeight / node.scrollWidth) !== (node.offsetHeight / node.offsetWidth);

        if ((event.currentTarget === node) && checkOverflow) {
            node.scrollLeft += event.deltaX;
            event.preventDefault();
            event.stopPropagation();
        }
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
