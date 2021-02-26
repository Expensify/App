import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import Avatar from '../../../components/Avatar';
import PropTypes from 'prop-types';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,
};

class IOUAmountPage extends Component {
    constructor(props) {
        super(props);

        // TODO
    }

    render() {
        return <TouchableOpacity
                    onPress={() => this.props.onStepComplete()}
                >
                    <Avatar source="https://http.cat/101" />
                </TouchableOpacity>
    }
}

IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;

export default IOUAmountPage;
