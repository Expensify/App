import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import CommentActionsMenu from './CommentActionsMenu/CommentActionsMenu';
import Hoverable from '../../../components/Hoverable';
import themeColors from '../../../styles/themes/default';
import positioning from '../../../styles/utilities/positioning';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

function getReportActionContainerStyle(isHovered = false) {
    return {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isHovered ? themeColors.activeComponentBG : themeColors.componentBG,
    };
}

const miniCommentActionsMenuWrapperStyle = {
    ...positioning.r4,
    position: 'absolute',
};

const ReportActionItem = props => (
    <>
        <Hoverable>
            {isHovered => (
                <View style={getReportActionContainerStyle(isHovered)}>
                    {!props.displayAsGroup
                        ? <ReportActionItemSingle action={props.action} />
                        : <ReportActionItemGrouped action={props.action} />}
                    <View style={miniCommentActionsMenuWrapperStyle}>
                        <CommentActionsMenu reportID="" reportActionID="" isMini shouldShow={isHovered} />
                    </View>
                </View>
            )}
        </Hoverable>
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
