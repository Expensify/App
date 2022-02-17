import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import htmlRendererPropTypes from '../htmlRendererPropTypes';


const propTypes = {
    ...htmlRendererPropTypes,
};

class PreRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollRef = React.createRef();
        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
        this.scrollRef.current.addEventListener('wheel', this.onScroll);
    }

    componentWillUnmount() {
        this.scrollRef.current.removeEventListener('wheel', this.onScroll);
    }

    onScroll(e) {
        this.scrollRef.current.scrollLeft += e.deltaX;
    }

    render() {
        const TDefaultRenderer = this.props.TDefaultRenderer;
        return (
            <ScrollView ref={this.scrollRef} horizontal style={this.props.style}>
                <TDefaultRenderer
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    style={{flexGrow: 1, flexShrink: 1, padding: 10}}
                />
            </ScrollView>
        );
    }
}

PreRenderer.propTypes = propTypes;
PreRenderer.displayName = 'PreRenderer';

export default PreRenderer;
