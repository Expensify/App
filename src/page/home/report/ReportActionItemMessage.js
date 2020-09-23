import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionItemFragment from './ReportActionItemFragment';
import ReportActionPropTypes from './ReportActionPropTypes';

const propTypes = {
    // The report action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

const ReportActionItemMessage = ({action}) => (
    <>
        {_.map(_.compact(action.message), fragment => (
            <ReportActionItemFragment
                key={_.uniqueId('actionFragment', action.sequenceNumber)}
                fragment={fragment}
                isAttachment={action.isAttachment}
            />
        ))}
    </>
);

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default ReportActionItemMessage;
