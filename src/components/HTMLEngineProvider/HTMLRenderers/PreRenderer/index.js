import React from 'react';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.scrollNode = this.scrollNode.bind(this);
    }

    componentDidMount() {
        if (!this.ref) {
            return;
        }
        this.ref
            .getScrollableNode()
            .addEventListener('wheel', this.scrollNode);
    }

    componentWillUnmount() {
        this.ref.getScrollableNode()
            .removeEventListener('wheel', this.scrollNode);
    }

    scrollNode(event) {
        const node = this.ref.getScrollableNode();
        const horizontalOverflow = node.scrollWidth > node.offsetWidth;

        if ((event.currentTarget === node) && horizontalOverflow) {
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
                ref={el => this.ref = el}
            />
        );
    }
}

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
