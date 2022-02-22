import React from 'react';
import BasePreRenderer from './BasePreRenderer';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.onScroll = this.onScroll.bind(this);
        this.onPress = this.onPress.bind(this);
    }

    componentDidMount() {
        if (!this.scrollRef) {
            return;
        }
        this.scrollNode = this.scrollRef.getScrollableNode();
        this.scrollNode.addEventListener('mousedown', this.onPress);
        this.scrollNode.addEventListener('wheel', this.onScroll);
    }

    componentWillUnmount() {
        this.scrollNode.removeEventListener('wheel', this.onScroll);
        this.scrollNode.removeEventListener('mousedown', this.onPress);
    }

    onPress(e) {
        const isScrollbar = e.target.classList.contains('r-WebkitOverflowScrolling-150rngu');
        if (isScrollbar) {
            e.stopPropagation();
        }
    }

    onScroll(e) {
        this.scrollRef.getScrollableNode().scrollLeft += e.deltaX;
        e.preventDefault();
    }

    render() {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <BasePreRenderer ref={el => this.scrollRef = el} {...this.props} />
        );
    }
}

export default PreRenderer;
