import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import RenderHTML from './RenderHTML';

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
                <RenderHTML key={`iouQuote-${action.sequenceNumber}-${index}`} html={html} />
            );
        })}
    </View>
);

ReportActionItemIOUQuote.propTypes = propTypes;
ReportActionItemIOUQuote.displayName = 'ReportActionItemIOUQuote';

export default ReportActionItemIOUQuote;
