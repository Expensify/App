import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionContextMenu from './ReportActionContextMenu/ReportActionContextMenu';
import Hoverable from '../../../components/Hoverable';
import styles from '../../../styles/styles';
import getReportActionItemContainerStyles from '../../../styles/getReportActionItemContainerStyles';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

const ReportActionItem = props => (
    <>
        <Hoverable>
            {isHovered => (
                <View style={getReportActionItemContainerStyles(isHovered)}>
                    {!props.displayAsGroup
                        ? <ReportActionItemSingle action={props.action} />
                        : <ReportActionItemGrouped action={props.action} />}
                    <View style={styles.miniReportActionContextMenuWrapperStyle}>
                        <ReportActionContextMenu reportID="" reportActionID="" isMini shouldShow={isHovered} />
                    </View>
                </View>
            )}
        </Hoverable>
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
