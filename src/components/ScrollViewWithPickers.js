import React from 'react';
import {ScrollView} from 'react-native';

// eslint-disable-next-line rulesdir/no-inline-named-export
export const ScrollViewWithPickersContext = React.createContext();

// eslint-disable-next-line react/forbid-foreign-prop-types
const propTypes = ScrollView.propTypes;

/*
* <ScrollViewWithPickers /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
* <ScrollViewWithPickers /> can be used as a direct replacement for <ScrollView />
* if it contains one or more <Picker /> / <RNPickerSelect /> components.
* Using this wrapper will automatically hadnle scrolling to the picker's <TextInput />
* when the picker modal is opened
*/
class ScrollViewWithPickers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentOffsetY: 0,
        };
        this.scrollViewRef = React.createRef(null);

        this.handleScroll = this.handleScroll.bind(this);
    }

    handleScroll(event) {
        if (this.props.onScroll) {
            this.props.onScroll(event);
        }
        this.setState({contentOffsetY: event.nativeEvent.contentOffset.y});
    }

    render() {
        // eslint-disable-next-line react/destructuring-assignment
        const {children, scrollEventThrottle, ...propsWithoutChildrenAndScrollEventThrottle} = this.props;
        return (
            <ScrollView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...propsWithoutChildrenAndScrollEventThrottle}
                ref={this.scrollViewRef}
                onScroll={this.handleScroll}
                scrollEventThrottle={scrollEventThrottle || 16}
            >
                <ScrollViewWithPickersContext.Provider
                    value={{
                        scrollViewRef: this.scrollViewRef,
                        contentOffsetY: this.state.contentOffsetY,
                    }}
                >
                    {children}
                </ScrollViewWithPickersContext.Provider>
            </ScrollView>
        );
    }
}
ScrollViewWithPickers.propTypes = propTypes;

export default ScrollViewWithPickers;
