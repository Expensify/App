import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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

const IOUQuote = props => (
    <View style={[styles.chatItemMessage]}>
        {_.map(props.action.message, (fragment, index) => (
            <View key={`iouQuote-${props.action.sequenceNumber}-${index}`} style={[styles.alignItemsStart, styles.blockquote]}>
                <Text style={[styles.chatItemMessage]}>
                    {Str.htmlDecode(fragment.text)}
                </Text>
                {props.shouldShowViewDetailsLink && (
                    <Text
                        style={[styles.chatItemMessageLink, styles.alignSelfStart]}
                        onPress={props.onViewDetailsPressed}
                    >
                        {props.translate('iou.viewDetails')}
                    </Text>
                )}
            </View>
        ))}
    </View>
);

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
