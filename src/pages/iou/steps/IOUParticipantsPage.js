import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from '../../../components/Avatar';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,
};

class IOUParticipantsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
        };

        // TODO: Hide loading indicator and display IOUParticipants page contents
    }

    render() {
        return (
            <View style={styles.settingsWrapper}>
                <Avatar source="https://http.cat/102" />
                {this.state.isLoading && <ActivityIndicator color={themeColors.text} />}
                <TouchableOpacity
                    style={[styles.button, styles.w100, styles.mt5]}
                    onPress={() => this.props.onStepComplete()}
                >
                    <Text style={[styles.buttonText]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

IOUParticipantsPage.displayName = 'IOUParticipantsPage';
IOUParticipantsPage.propTypes = propTypes;

export default IOUParticipantsPage;
