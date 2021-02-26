import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import Avatar from '../../../components/Avatar';

class IOUParticipantsPage extends Component {
    constructor(props) {
        super(props);

        // TODO
    }

    render() {
        return <TouchableOpacity
                    onPress={() => this.props.onStepComplete()}
                >
                    <Avatar source="https://http.cat/102" />
                </TouchableOpacity>
    }
}

IOUParticipantsPage.displayName = 'IOUParticipantsPage';

export default IOUParticipantsPage;
