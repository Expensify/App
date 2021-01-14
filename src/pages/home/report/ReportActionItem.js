import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import CommentActionsMenu from './CommentActionsMenu/CommentActionsMenu';
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
    ...positioning.tn4,
    ...positioning.r4,
    position: 'absolute',
};

const ReportActionItem = props => (
    <>
        <Pressable>
            {({hovered}) => (
                <View style={getReportActionContainerStyle(hovered)}>
                    {!props.displayAsGroup
                        ? <ReportActionItemSingle action={props.action} />
                        : <ReportActionItemGrouped action={props.action} />}
                    <View style={miniCommentActionsMenuWrapperStyle}>
                        <CommentActionsMenu reportID="" reportActionID="" isMini shouldShow={hovered} />
                    </View>
                </View>
            )}
        </Pressable>
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
