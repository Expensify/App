import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import _ from 'underscore';
import withLocalize from '../../withLocalize';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const PreRenderer = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer']);

    return (
        <ScrollView horizontal>
            <View onStartShouldSetResponder={() => true}>
                <TDefaultRenderer
                     // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                />
            </View>
        </ScrollView>
    );
};

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
