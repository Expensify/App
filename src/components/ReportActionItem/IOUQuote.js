import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import ReportActionPropTypes from '../../pages/home/report/ReportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Should the View Details link be displayed? */
    shouldShowViewDetailsLink: PropTypes.bool,

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowViewDetailsLink: false,
    onViewDetailsPressed: () => {},
};

const IOUQuote = ({
    action,
    shouldShowViewDetailsLink,
    onViewDetailsPressed,
    translate,
}) => (
    <View style={[styles.chatItemMessage]}>
        {_.map(action.message, (fragment, index) => (
            <View key={`iouQuote-${action.sequenceNumber}-${index}`}>
                <View style={[styles.blockquote]}>
                    <Text style={[styles.chatItemMessage]}>
                        {fragment.text}
                    </Text>
                    {shouldShowViewDetailsLink && (
                        <Text
                            style={[styles.chatItemMessageLink]}
                            onPress={onViewDetailsPressed}
                        >
                            {translate('iou.viewDetails')}
                        </Text>
                    )}
                </View>
            </View>
        ))}
    </View>
);

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
