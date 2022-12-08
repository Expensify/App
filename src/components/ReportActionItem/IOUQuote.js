import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import CONST from '../../CONST';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Whether it is allowed to view details. */
    shouldAllowViewDetails: PropTypes.bool,

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldAllowViewDetails: false,
    onViewDetailsPressed: () => {},
};

const IOUQuote = (props) => {
    const formatCurrencySymbol = (text) => {
        // offsetInText is the index in number of words we expect to see currencyCode in text
        const convertCurrencyCodeToSymbol = (currencyCodeIndexInText) => {
            const words = text.split(' ');
            const amountWithCode = words[currencyCodeIndexInText];
            const currency = amountWithCode.substring(0, 3);
            const amount = Number(amountWithCode.substring(4));
            const formattedAmount = props.numberFormat(
                amount,
                {style: 'currency', currency},
            );

            // debugger;
            return _.map(words, ((word, i) => (i === currencyCodeIndexInText ? formattedAmount : word))).join(' ');
        };

        switch (lodashGet(props.action, 'originalMessage.type')) {
            case CONST.IOU.REPORT_ACTION_TYPE.CREATE:
                return convertCurrencyCodeToSymbol(1);
            case CONST.IOU.REPORT_ACTION_TYPE.PAY:
                return convertCurrencyCodeToSymbol(2);
            case CONST.IOU.REPORT_ACTION_TYPE.CANCEL:
                return convertCurrencyCodeToSymbol(2);
            case CONST.IOU.REPORT_ACTION_TYPE.DECLINE:
                return convertCurrencyCodeToSymbol(2);
            case CONST.IOU.REPORT_ACTION_TYPE.SPLIT:
                return convertCurrencyCodeToSymbol(2);
            default:
                return text;
        }
    };

    const renderIOUMessage = fragment => (
        <Text>
            <Text style={props.shouldAllowViewDetails && styles.chatItemMessageLink}>
                {/* Get first word of IOU message */}
                {Str.htmlDecode(fragment.text.split(' ')[0])}
            </Text>
            <Text style={[styles.chatItemMessage, styles.cursorPointer]}>
                {/* Get remainder of IOU message */}
                {formatCurrencySymbol(Str.htmlDecode(fragment.text.substring(fragment.text.indexOf(' '))))}
            </Text>
        </Text>
    );

    return (
        <View style={[styles.chatItemMessage]}>
            {_.map(props.action.message, (fragment, index) => (
                <Pressable
                    key={`iouQuote-${props.action.reportActionID}-${index}`}
                    onPress={props.shouldAllowViewDetails
                        ? props.onViewDetailsPressed
                        : () => {
                        }}
                    style={[styles.flexRow, styles.justifyContentBetween,
                        props.shouldAllowViewDetails
                            ? undefined
                            : styles.cursorDefault,
                    ]}
                    focusable={props.shouldAllowViewDetails}
                >
                    {renderIOUMessage(fragment)}
                    <Icon src={Expensicons.ArrowRight} fill={props.shouldAllowViewDetails ? themeColors.icon : themeColors.transparent} />
                </Pressable>
            ))}
        </View>
    );
};

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
