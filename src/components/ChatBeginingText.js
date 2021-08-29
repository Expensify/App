import React, {memo} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import colors from '../styles/colors';

const propTypes = {

    isDefaultChatRoom: PropTypes.bool,
    chatUsers: PropTypes.arrayOf(PropTypes.object),

};

const defaultProps = {
    chatUsers: [],
    isDefaultChatRoom: false,
};

const ChatBeginingText = ({isDefaultChatRoom, chatUsers}) => (
    <Text style={[styles.mt3, styles.w50, styles.textAlignCenter]}>
        <Text style={[{color: colors.dark}]}>
            {/* {this.props.translate('reportActionsView.beFirstPersonToComment')} */}
            {isDefaultChatRoom ? 'This is the beginning of the private ' : 'This is the beginning of your chat history with '}
        </Text>
        {isDefaultChatRoom
            && (
                <Text style={[{color: colors.dark}]}>
                    {`${chatUsers?.[0]?.displayName} room, invite others by @mentioning them.`}
                </Text>
            )}
        {!isDefaultChatRoom
            && (
                <Text>
                    {chatUsers.map(({displayName, pronouns}, index) => (
                        <Text key={displayName}>
                            <Text style={[{color: colors.dark, fontWeight: 700}]}>
                                {displayName}
                            </Text>
                            {pronouns !== undefined
                                && (
                                <Text>
                                    {`(${pronouns})`}
                                </Text>
                                )}
                            {(chatUsers.length === 1 || chatUsers.length - 1 === index) && '.'}
                            {(chatUsers.length - 2 === index && chatUsers.length > 1) && ' and '}
                            {(chatUsers.length - 2 !== index && chatUsers.length - 1 !== index) && chatUsers.length > 1 && ', '}

                        </Text>
                    ))}

                </Text>
            )}
    </Text>
);

ChatBeginingText.defaultProps = defaultProps;
ChatBeginingText.propTypes = propTypes;
export default memo(ChatBeginingText);
