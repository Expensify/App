import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import {getIOUReportDetailFromTransactionID} from '../libs/actions/IOU';
import styles, {webViewStyles} from '../styles/styles';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

const ReportActionItemIOUQuote = ({action}) => (
    <View style={[styles.chatItemMessage]}>
        {_.map(action.message, (fragment, index) => {
            const viewDetails = '<br /><a href="#">View Details</a>';
            const html = `<blockquote>${fragment.text}${viewDetails}</blockquote>`;
            return (
                <View key={`iouQuote-${action.sequenceNumber}-${index}`}>
                    <View style={[webViewStyles.tagStyles.blockquote]}>
                        <Text style={[styles.chatItemMessage]}>
                            {fragment.text}
                        </Text>
                        <Text style={[styles.chatItemMessageLink]} onPress={() => {
                            if (!action.originalMessage) {
                                console.error('reportAction `originalMessage` data not provided.');
                            }
                            if (action.originalMessage.IOUTransactionID) {
                                getIOUReportDetailFromTransactionID(action.originalMessage.IOUTransactionID);
                            } else if (action.originalMessage.IOUReportID) {
                                Navigation.navigate(ROUTES.getIouDetailsRoute(action.originalMessage.IOUReportID));
                            }
                        }}>
                            View Details
                        </Text>
                    </View>
                </View>
            );
        })}
    </View>
);

ReportActionItemIOUQuote.propTypes = propTypes;
ReportActionItemIOUQuote.displayName = 'ReportActionItemIOUQuote';

export default ReportActionItemIOUQuote;
