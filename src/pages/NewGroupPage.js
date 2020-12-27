import _ from 'underscore';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import ChatSelector from '../components/ChatSelector';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import {fetchOrCreateChatReport} from '../libs/actions/Report';

const MAX_GROUP_DM_LENGTH = 8;

class NewGroupPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            usersToStartGroupReportWith: [],
        };
    }

    /**
     * @param {Object} option
     */
    toggleUser(option) {
        // Doesn't toggle yet just adds them for now...
        this.setState(prevState => ({
            usersToStartGroupReportWith: [...prevState.usersToStartGroupReportWith, option],
        }));
    }

    startGroupChat() {
        const userLogins = _.map(this.state.usersToStartGroupReportWith, option => option.login);
        fetchOrCreateChatReport([this.props.session.email, ...userLogins]);

        // We need to handle errors here and possibly send a "headerMessage" error? Or just
        // alert... the modal would be closed at this point and we should redirect to the chat
    }

    render() {
        const maxParticipantsReached = this.state.usersToStartGroupReportWith.length === MAX_GROUP_DM_LENGTH;
        return (
            <>
                <HeaderWithCloseButton
                    title="New Group"
                    onCloseButtonPress={() => {}}
                />
                <ChatSelector
                    showContacts
                    showRecentChats
                    numberOfRecentChatsToShow={5}
                    canInviteUsers
                    canSelectMultipleOptions
                    selectedOptions={this.state.usersToStartGroupReportWith}
                    onSelectOption={(option) => {
                        this.toggleUser(option);
                    }}
                    headerTitle={
                        maxParticipantsReached
                            ? 'Maximum participants reached'
                            : ''
                    }
                    headerMessage={
                        maxParticipantsReached
                            ? 'You\'ve reached the maximum number of participants for a group chat.'
                            : ''
                    }
                />
                <TouchableOpacity
                    onPress={() => this.startGroupChat()}
                >
                    <Text>Go</Text>
                </TouchableOpacity>
            </>
        );
    }
}

export default NewGroupPage;
