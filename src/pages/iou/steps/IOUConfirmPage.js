import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import Avatar from '../../../components/Avatar';

class IOUConfirmPage extends Component {
    constructor(props) {
        super(props);

        // TODO
    }

    render() {
        return <TouchableOpacity
                    onPress={() => this.props.onStepComplete()}
                >
                    <Avatar source="https://http.cat/400" />
                </TouchableOpacity>
    }
}

IOUConfirmPage.displayName = 'IOUConfirmPage';

export default IOUConfirmPage;
