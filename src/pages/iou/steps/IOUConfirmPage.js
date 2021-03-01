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

class IOUConfirmPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
        };

        // TODO: Hide loading indicator and display IOUConfirm page contents
    }

    render() {
        return (
            <View style={styles.settingsWrapper}>
                <Avatar source="https://http.cat/400" />
                {this.state.isLoading && <ActivityIndicator color={themeColors.text} />}
                <TouchableOpacity
                    style={[styles.button, styles.w100, styles.mt5]}
                    onPress={() => this.props.onStepComplete()}
                >
                    <Text style={[styles.buttonText]}>
                        Request $42.00
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;

export default IOUConfirmPage;
