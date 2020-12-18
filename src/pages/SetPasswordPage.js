import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    View,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import {withRouter} from '../libs/Router';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import logo from '../../assets/images/expensify-logo-round.png';
import CustomStatusBar from '../components/CustomStatusBar';
import {setPassword} from '../libs/actions/Session';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);

        this.state = {
            password: '',
            isLoading: false,
        };
    }

    /**
     * Sign into the application when the form is submitted
     */
    submitForm() {
        this.setState({isLoading: true});
        setPassword(this.state.password, this.props.match.validateCode);
    }

    render() {
        return (
            <>
                <CustomStatusBar />
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]} accessibilityRole="form">
                        <View style={[styles.signInPageLogo]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinLogo]}
                                source={logo}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel]}>Password</Text>
                            <TextInput
                                style={[styles.textInput]}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.password}
                                onChangeText={text => this.setState({password: text})}
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        <View>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.mb4]}
                                onPress={this.submitForm}
                                underlayColor={themeColors.componentBG}
                                disabled={this.state.isLoading}
                            >
                                {this.state.isLoading ? (
                                    <ActivityIndicator color={themeColors.textReversed} />
                                ) : (
                                    <Text style={[styles.buttonText, styles.buttonSuccessText]}>Set Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}

SetPasswordPage.propTypes = propTypes;

export default compose(
    withRouter,
)(SetPasswordPage);
