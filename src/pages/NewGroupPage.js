import _ from 'underscore';
import React from 'react';
import ChatSelector from '../components/ChatSelector';

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

    render() {
        return (
            <ChatSelector
                headerTitle="New Group"
                showContacts
                showRecentChats
                numberOfRecentChatsToShow={5}
                canInviteUsers
                canSelectMultipleOptions
                selectedOptions={this.state.usersToStartGroupReportWith}
                onSelectOption={(option) => {
                    this.toggleUser(option);
                }}
            />
        );
    }
}

export default NewGroupPage;
