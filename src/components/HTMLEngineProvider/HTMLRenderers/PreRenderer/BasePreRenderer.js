import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import _ from 'underscore';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import withLocalize from '../../../withLocalize';

const BasePreRenderer = forwardRef((props, ref) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer']);

    return (
        <ScrollView
            ref={ref}
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
});

BasePreRenderer.displayName = 'BasePreRenderer';
BasePreRenderer.propTypes = htmlRendererPropTypes;

export default withLocalize(BasePreRenderer);
