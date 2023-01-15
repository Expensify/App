import React, {Component} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PDF from 'react-native-pdf';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import Text from '../Text';
import PDFPasswordForm from './PDFPasswordForm';
import {propTypes as pdfViewPropTypes, defaultProps} from './pdfViewPropTypes';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import withLocalize from '../withLocalize';

const propTypes = {
    ...pdfViewPropTypes,
    ...keyboardStatePropTypes,
};

/**
 * On the native layer, we use react-native-pdf/PDF to display PDFs. If a PDF is
 * password-protected we render a PDFPasswordForm to request a password
 * from the user.
 *
 * In order to render things nicely during a password challenge we need
 * to keep track of additional state. In particular, the
 * react-native-pdf/PDF component is both conditionally rendered and hidden
 * depending upon the situation. It needs to be rerendered on each password
 * submission because it doesn't dynamically handle updates to its
 * password property. And we need to hide it during password challenges
 * so that PDFPasswordForm doesn't bounce when react-native-pdf/PDF
 * is (temporarily) rendered.
 */
class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shouldRequestPassword: false,
            shouldAttemptPDFLoad: true,
            shouldShowLoadingIndicator: true,
            isPasswordInvalid: false,
            failedToLoadPDF: false,
            password: '',
        };
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
        this.attemptPDFLoadWithPassword = this.attemptPDFLoadWithPassword.bind(this);
        this.finishPDFLoad = this.finishPDFLoad.bind(this);
        this.handleFailureToLoadPDF = this.handleFailureToLoadPDF.bind(this);
    }

    componentDidUpdate() {
        this.props.onToggleKeyboard(this.props.isKeyboardShown);
    }

    handleFailureToLoadPDF(error) {
        if (error.message.match(/password/i)) {
            this.initiatePasswordChallenge();
            return;
        }

        this.setState({
            failedToLoadPDF: true,
            shouldAttemptPDFLoad: false,
        });
    }

    /**
     * Initiate password challenge if message received from react-native-pdf/PDF
     * indicates that a password is required or invalid.
     *
     * For a password challenge the message is "Password required or incorrect password."
     * Note that the message doesn't specify whether the password is simply empty or
     * invalid.
     */
    initiatePasswordChallenge() {
        this.setState({shouldShowLoadingIndicator: false});

        // Render password form, and don't render PDF and loading indicator.
        this.setState({
            shouldRequestPassword: true,
            shouldAttemptPDFLoad: false,
        });

        // The message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (this.state.password) {
            this.setState({isPasswordInvalid: true});
        }
    }

    /**
     * When the password is submitted via PDFPasswordForm, save the password
     * in state and attempt to load the PDF. Also show the loading indicator
     * since react-native-pdf/PDF will need to reload the PDF.
     *
     * @param {String} password Password submitted via PDFPasswordForm
     */
    attemptPDFLoadWithPassword(password) {
        // Render react-native-pdf/PDF so that it can validate the password.
        // Note that at this point in the password challenge, shouldRequestPassword is true.
        // Thus react-native-pdf/PDF will be rendered - but not visible.
        this.setState({
            password,
            shouldAttemptPDFLoad: true,
            shouldShowLoadingIndicator: true,
        });
    }

    /**
     * After the PDF is successfully loaded hide PDFPasswordForm and the loading
     * indicator.
     */
    finishPDFLoad() {
        this.setState({
            shouldRequestPassword: false,
            shouldShowLoadingIndicator: false,
        });
    }

    render() {
        const pdfStyles = [
            styles.imageModalPDF,
            StyleUtils.getWidthAndHeightStyle(this.props.windowWidth, this.props.windowHeight),
        ];
        const touchableStyles = [
            styles.flex1,
            this.props.style,
            styles.w100,
        ];

        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF component so that it can validate the password.
        if (this.state.shouldRequestPassword) {
            pdfStyles.push(styles.invisible);
        }

        const containerStyles = this.state.shouldRequestPassword && this.props.isSmallScreenWidth
            ? [styles.w100, styles.flex1]
            : [styles.alignItemsCenter, styles.flex1];

        return (
            <View style={containerStyles}>
                {this.state.failedToLoadPDF && (
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text style={[styles.textLabel, styles.textLarge]}>
                            {this.props.translate('attachmentView.failedToLoadPDF')}
                        </Text>
                    </View>
                )}
                {this.state.shouldAttemptPDFLoad && (
                    <TouchableWithoutFeedback style={touchableStyles}>
                        <PDF
                            trustAllCerts={false}
                            renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                            source={{uri: this.props.sourceURL}}
                            style={pdfStyles}
                            onError={this.handleFailureToLoadPDF}
                            password={this.state.password}
                            onLoadComplete={this.finishPDFLoad}
                            onPageSingleTap={this.props.onPress}
                        />
                    </TouchableWithoutFeedback>
                )}
                {this.state.shouldRequestPassword && (
                    <KeyboardAvoidingView style={styles.flex1}>
                        <PDFPasswordForm
                            onSubmit={this.attemptPDFLoadWithPassword}
                            onPasswordUpdated={() => this.setState({isPasswordInvalid: false})}
                            isPasswordInvalid={this.state.isPasswordInvalid}
                            shouldShowLoadingIndicator={this.state.shouldShowLoadingIndicator}
                        />
                    </KeyboardAvoidingView>
                )}
            </View>
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withKeyboardState,
    withLocalize,
)(PDFView);
