import React from 'react';
import _ from 'underscore';
import {ScrollView} from 'react-native-gesture-handler';
import htmlRendererPropTypes from '../htmlRendererPropTypes';


const propTypes = {
    ...htmlRendererPropTypes,
};

const PreRenderer = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer']);

    return (
        <ScrollView horizontal style={props.style}>
            <TDefaultRenderer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                style={{flexGrow: 1, flexShrink: 1, padding: 10}}
            />
        </ScrollView>
    );
};

PreRenderer.propTypes = propTypes;
PreRenderer.displayName = 'PreRenderer';

export default PreRenderer;
