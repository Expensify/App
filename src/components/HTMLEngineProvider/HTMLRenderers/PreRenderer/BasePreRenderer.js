import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import _ from 'underscore';
import htmlRendererPropTypes from '../htmlRendererPropTypes';

class BasePreRenderer extends React.Component {
    render() {
        const TDefaultRenderer = this.props.TDefaultRenderer;
        const defaultRendererProps = _.omit(this.props, ['TDefaultRenderer']);
        return (
            <ScrollView
                ref={this.props.innerRef}
                horizontal
            >
                <View
                    onStartShouldSetResponder={() => true}
                >
                    <TDefaultRenderer
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...defaultRendererProps}
                    />
                </View>
            </ScrollView>
        );
    }
}

BasePreRenderer.propTypes = htmlRendererPropTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePreRenderer {...props} innerRef={ref} />
));
