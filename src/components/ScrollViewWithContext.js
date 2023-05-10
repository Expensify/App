import React from 'react';
import {ScrollView} from 'react-native';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

const ScrollContext = React.createContext();

// eslint-disable-next-line react/forbid-foreign-prop-types
const propTypes = ScrollView.propTypes;

/*
* <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
* <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
* if it contains one or more <Picker /> / <RNPickerSelect /> components.
* Using this wrapper will automatically handle scrolling to the picker's <TextInput />
* when the picker modal is opened
*/
class ScrollViewWithContext extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentOffsetY: 0,
        };
        this.scrollViewRef = this.props.innerRef || React.createRef(null);

        this.setContextScrollPosition = this.setContextScrollPosition.bind(this);
    }

    setContextScrollPosition(event) {
        if (this.props.onScroll) {
            this.props.onScroll(event);
        }
        this.setState({contentOffsetY: event.nativeEvent.contentOffset.y});
    }

    render() {
        return (
            <ScrollView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.scrollViewRef}
                onScroll={this.setContextScrollPosition}
                scrollEventThrottle={this.props.scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            >
                <ScrollContext.Provider
                    value={{
                        scrollViewRef: this.scrollViewRef,
                        contentOffsetY: this.state.contentOffsetY,
                    }}
                >
                    {this.props.children}
                </ScrollContext.Provider>
            </ScrollView>
        );
    }
}
ScrollViewWithContext.propTypes = propTypes;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScrollViewWithContext {...props} innerRef={ref} />
));

export {
    ScrollContext,
};
