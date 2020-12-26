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
     * Adds a user to the usersToStartGroupReportWith array
     *
     * @param {Object} option
     */
    addUserToGroup(option) {
        this.setState(prevState => ({
            usersToStartGroupReportWith: [...prevState.usersToStartGroupReportWith, option],
        }));
    }

    /**
     * Removes a user from the usersToStartGroupReportWith array
     *
     * @param {Object} [selectedOption] remove last when no option provided
     */
    removeUserFromGroup(selectedOption) {
        this.setState(prevState => ({
            usersToStartGroupReportWith: _.reduce(prevState.usersToStartGroupReportWith, (users, option) => (
                option.login === selectedOption.login
                    ? users
                    : [...users, option]
            ), []),
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
                    this.addUserToGroup(option);
                }}
                onRemoveOption={(option) => {
                    this.removeUserFromGroup(option);
                }}
            />
        );
    }
}

export default NewGroupPage;
