import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ChatSelector from '../components/ChatSelector';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import ONYXKEYS from '../ONYXKEYS';

const NewChatPage = props => (
    <>
        <HeaderWithCloseButton
            title="New Group"
            onCloseButtonPress={() => {}}
        />
        <ChatSelector
            showContacts
            canInviteUsers
            onSelectOption={(option) => {
                const {email} = props.session;
                fetchOrCreateChatReport([email, option.login]);
            }}
        />
    </>
);

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(NewChatPage);
