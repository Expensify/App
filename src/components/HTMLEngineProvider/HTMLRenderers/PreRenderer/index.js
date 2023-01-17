import React from 'react';
import _ from 'underscore';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import BasePreRenderer from './BasePreRenderer';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import ControlSelection from '../../../../libs/ControlSelection';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.scrollNode = this.scrollNode.bind(this);
        this.debouncedIsScrollingVertically = _.debounce(this.isScrollingVertically.bind(this), 100, true);
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
     * Check if user is scrolling vertically based on deltaX and deltaY. We debounce this
     * method in the constructor to make sure it's called only for the first event.
     * @param {WheelEvent} event Wheel event
     * @returns {Boolean} true if user is scrolling vertically
     */
    isScrollingVertically(event) {
        // Mark as vertical scrolling only when absolute value of deltaY is more than the double of absolute
        // value of deltaX, so user can use trackpad scroll on the code block horizontally at a wide angle.
        return Math.abs(event.deltaY) > (Math.abs(event.deltaX) * 2);
    }

    /**
     * Manually scrolls the code block if code block horizontal scrollable, then prevents the event from being passed up to the parent.
     * @param {Object} event native event
     */
    scrollNode(event) {
        const node = this.ref.getScrollableNode();
        const horizontalOverflow = node.scrollWidth > node.offsetWidth;
        const isScrollingVertically = this.debouncedIsScrollingVertically(event);
        if ((event.currentTarget === node) && horizontalOverflow && !isScrollingVertically) {
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
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
            />
        );
    }
}

PreRenderer.propTypes = htmlRendererPropTypes;

export default withLocalize(PreRenderer);
