import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {TouchableWithoutFeedback, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import withLocalize from '../../../withLocalize';
import {ShowContextMenuContext, showContextMenuForReport} from '../../../ShowContextMenuContext';
import styles from '../../../../styles/styles';

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
            style={styles.mv2}
        >
            <ShowContextMenuContext.Consumer>
                {({
                    anchor,
                    reportID,
                    action,
                    checkIfContextMenuActive,
                }) => (
                    <TouchableWithoutFeedback
                        onPressIn={props.onPressIn}
                        onPressOut={props.onPressOut}
                        onLongPress={event => showContextMenuForReport(event, anchor, reportID, action, checkIfContextMenuActive)}
                    >
                        <View>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <TDefaultRenderer {...defaultRendererProps} />
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </ScrollView>
    );
});

BasePreRenderer.displayName = 'BasePreRenderer';
BasePreRenderer.propTypes = propTypes;
BasePreRenderer.defaultProps = defaultProps;

export default withLocalize(BasePreRenderer);
