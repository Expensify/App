import React from 'react';
import BasePreRenderer from './BasePreRenderer';

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollRef = null;
        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
        if (!this.scrollRef) {
            return;
        }
        this.scrollRef.getScrollableNode().addEventListener('wheel', this.onScroll);
    }

    componentWillUnmount() {
        this.scrollRef.getScrollableNode().removeEventListener('wheel', this.onScroll);
    }

    onScroll(e) {
        this.scrollRef.getScrollableNode().scrollLeft += e.deltaX;
    }

    render() {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <BasePreRenderer ref={el => this.scrollRef = el} {...this.props} />
        );
    }
}

export default PreRenderer;
