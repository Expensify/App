import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import getReportActionItemContainerStyles from '../../../styles/getReportActionItemContainerStyles';
import Hoverable from '../../../components/Hoverable';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Set this action as the active reportAction for the report.
    setIsActive: PropTypes.func.isRequired,
};

const ReportActionItem = React.forwardRef((props, ref) => (
    <Hoverable
        onHoverIn={() => props.setIsActive(true)}
        onHoverOut={() => props.setIsActive(false)}
    >
        {hovered => (
            <View ref={ref} style={getReportActionItemContainerStyles(hovered)}>
                {!props.displayAsGroup
                    ? <ReportActionItemSingle action={props.action} />
                    : <ReportActionItemGrouped action={props.action} />}
            </View>
        )}
    </Hoverable>
));

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
