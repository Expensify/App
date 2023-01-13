import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import withLocalize from '../../../withLocalize';
import {ShowContextMenuContext, showContextMenuForReport} from '../../../ShowContextMenuContext';

const propTypes = {
    /** Press in handler for the code block */
    onPressIn: PropTypes.func,

    /** Press out handler for the code block */
    onPressOut: PropTypes.func,

    ...htmlRendererPropTypes,
};

const defaultProps = {
    onPressIn: undefined,
    onPressOut: undefined,
};

const BasePreRenderer = forwardRef((props, ref) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'onPressIn', 'onPressOut', 'onLongPress']);

    return (
        <ScrollView
            ref={ref}
            horizontal
        >
            <ShowContextMenuContext.Consumer>
                {({
                    anchor,
                    reportID,
                    action,
                    checkIfContextMenuActive,
                }) => (
                    <Pressable
                        onPressIn={props.onPressIn}
                        onPressOut={props.onPressOut}
                        onLongPress={event => showContextMenuForReport(event, anchor, reportID, action, checkIfContextMenuActive)}
                    >
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <TDefaultRenderer {...defaultRendererProps} />
                    </Pressable>
                )}
            </ShowContextMenuContext.Consumer>
        </ScrollView>
    );
});

BasePreRenderer.displayName = 'BasePreRenderer';
BasePreRenderer.propTypes = propTypes;
BasePreRenderer.defaultProps = defaultProps;

export default withLocalize(BasePreRenderer);
