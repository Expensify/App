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

        this.scrollViewRef = React.createRef(null);
    }

    render() {
        // eslint-disable-next-line react/destructuring-assignment
        const {children, ...propsWithoutChildren} = this.props;
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <ScrollView {...propsWithoutChildren} ref={this.scrollViewRef}>
                <ScrollViewWithPickersContext.Provider value={{scrollViewRef: this.scrollViewRef}}>
                    {children}
                </ScrollViewWithPickersContext.Provider>
            </ScrollView>
        );
    }
}
ScrollViewWithPickers.propTypes = propTypes;

export default ScrollViewWithPickers;
