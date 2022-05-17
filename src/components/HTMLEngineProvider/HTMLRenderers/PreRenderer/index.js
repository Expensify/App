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
        this.ref.getScrollableNode()
            .addEventListener('wheel', this.scrollNode);
    }

    componentWillUnmount() {
        this.ref.getScrollableNode()
            .removeEventListener('wheel', this.scrollNode);
    }

    /**
     * Manually scrolls the code block if code block horizontal scrollable, then prevents the event from being passed up to the parent.
     * @param {Object} event native event
     */
    scrollNode(event) {
        const node = this.ref.getScrollableNode();
        const horizontalOverflow = node.scrollWidth > node.offsetWidth;

        /* if the user scrolls horizontally while scrolling with two fingers on the touchpads,
        the fingers may go up a little during that scroll, and the page will start to scroll
        vertically due to this going up. With this sensitive we eliminate this bug. */
        const isVerticalScrolling = Math.abs(event.deltaY) > 3; // This is for touchpads sensitive
        if ((event.currentTarget === node) && horizontalOverflow && !isVerticalScrolling) {
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
