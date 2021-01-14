import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import getCommentActionsMenuStyles from '../../../../styles/getCommentActionsMenuStyles';
import getButtonState from '../../../../libs/getButtonState';
import CommentActions from './CommentActions';
import Expensicon from '../../../../components/Expensicons';
import variables from '../../../../styles/variables';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.string.isRequired,
    isMini: PropTypes.bool,
    shouldShow: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    shouldShow: false,
};

const CommentActionsMenu = (props) => {
    const {wrapperStyle, getButtonStyle} = getCommentActionsMenuStyles(props.isMini);
    return props.shouldShow && (
        <View style={[
            ...wrapperStyle,
            styles.flex1,
        ]}
        >
            {CommentActions.map((commentAction => (
                <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
                    {({pressed}) => (
                        <Expensicon
                            name={commentAction.icon}
                            width={pressed ? variables.iconSizeNormal + 4 : variables.iconSizeNormal}
                            height={pressed ? variables.iconSizeNormal + 4 : variables.iconSizeNormal}
                        />
                    )}
                </Pressable>
            )))}
        </View>
    );
};

CommentActionsMenu.propTypes = propTypes;
CommentActionsMenu.defaultProps = defaultProps;

export default CommentActionsMenu;
