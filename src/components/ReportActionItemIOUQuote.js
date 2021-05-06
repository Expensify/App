import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles, {webViewStyles} from '../styles/styles';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the View Details link be displayed?
    showViewDetailsLink: PropTypes.bool,

    // Callback invoked when View Details is pressed
    onViewDetailsPressed: PropTypes.func,
};

const defaultProps = {
    showViewDetailsLink: false,
    onViewDetailsPressed: null,
}

const ReportActionItemIOUQuote = ({action, showViewDetailsLink, onViewDetailsPressed}) => (
    <View style={[styles.chatItemMessage]}>
        {_.map(action.message, (fragment, index) => (
            <View key={`iouQuote-${action.sequenceNumber}-${index}`}>
                <View style={[webViewStyles.tagStyles.blockquote]}>
                    <Text style={[styles.chatItemMessage]}>
                        {fragment.text}
                    </Text>
                    {showViewDetailsLink && (
                        <Text
                            style={[styles.chatItemMessageLink]}
                            onPress={onViewDetailsPressed}
                        >
                            View Details
                        </Text>
                    )}
                </View>
            </View>
        ))}
    </View>
);

ReportActionItemIOUQuote.propTypes = propTypes;
ReportActionItemIOUQuote.defaultProps = defaultProps;
ReportActionItemIOUQuote.displayName = 'ReportActionItemIOUQuote';

export default ReportActionItemIOUQuote;
