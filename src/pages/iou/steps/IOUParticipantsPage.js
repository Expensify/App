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
    // callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // is this IOU request for a group bill split
    hasMultipleParticipants: PropTypes.bool.isRequired,

    // is page content being retrieved
    isLoading: PropTypes.bool.isRequired,
};

class IOUParticipantsPage extends Component {
    constructor(props) {
        super(props);

        // TODO: Hide loading indicator and display IOUParticipants page contents
    }

    render() {
        return (
            <View style={styles.settingsWrapper}>
                <Avatar source="https://http.cat/102" />
                <Text style={[styles.buttonText]}>
                    {this.props.hasMultipleParticipants ? '// group' : '// single'}
                </Text>
                {this.props.isLoading && <ActivityIndicator color={themeColors.text} />}
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
