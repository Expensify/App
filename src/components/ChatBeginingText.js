import React, {memo} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';

const propTypes = {

    isDefaultChatRoom: PropTypes.bool,
    chatUsers: PropTypes.arrayOf(PropTypes.object),
    ...withLocalizePropTypes,

};

const defaultProps = {
    chatUsers: [],
    isDefaultChatRoom: false,
};

const ChatBeginingText = ({isDefaultChatRoom, chatUsers, translate}) => (
    <Text style={[styles.mt3, styles.w70, styles.textAlignCenter]}>
        <Text>
            {isDefaultChatRoom ? `${translate('reportActionsView.beginingOfChatHistroyPrivate')} ` : `${translate('reportActionsView.beginingOfChatHistroy')} `}
        </Text>
        {isDefaultChatRoom
            && (
                <Text>
                    {`${chatUsers?.[0]?.displayName} ${translate('reportActionsView.beginingOfChatHistroyPrivateSectionPart')}`}
                </Text>
            )}
        {!isDefaultChatRoom
            && (
                <Text>
                    {chatUsers.map(({displayName, pronouns}, index) => (
                        <Text key={displayName}>
                            <Text style={[styles.chatTextStyle]}>
                                {displayName}
                            </Text>
                            {(pronouns !== undefined && pronouns !== '')
                                && (
                                <Text>
                                    {`(${pronouns})`}
                                </Text>
                                )}
                            {(chatUsers.length === 1 || chatUsers.length - 1 === index) && '.'}
                            {(chatUsers.length - 2 === index && chatUsers.length > 1) && ` ${translate('common.and')} `}
                            {(chatUsers.length - 2 !== index && chatUsers.length - 1 !== index) && chatUsers.length > 1 && ', '}

                        </Text>
                    ))}

                </Text>
            )}
    </Text>
);

ChatBeginingText.defaultProps = defaultProps;
ChatBeginingText.propTypes = propTypes;
export default compose(memo, withLocalize)(ChatBeginingText);
