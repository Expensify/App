import React from 'react';
import PropTypes from 'prop-types';
import ChatBubbleSvg from '../../../assets/images/chatbubble.svg';
import themeColors from '../../styles/themes/default';

const propTypes = {
    // Width of the icon
    width: PropTypes.number,

    // Height of the icon
    height: PropTypes.number,

    // Fill of the icon
    fill: PropTypes.string,
};

const defaultProps = {
    width: 20,
    height: 20,
    fill: themeColors.icon,
};

const ChatBubbleIcon = props => (
    <ChatBubbleSvg
        width={props.width}
        height={props.height}
        fill={props.fill}
    />
);

ChatBubbleIcon.propTypes = propTypes;
ChatBubbleIcon.defaultProps = defaultProps;

export default ChatBubbleIcon;
