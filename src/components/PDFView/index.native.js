import React, {Component} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PDF from 'react-native-pdf';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import withWindowDimensions from '../withWindowDimensions';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';
import {propTypes, defaultProps} from './pdfViewPropTypes';

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
            shouldAttemptPdfLoad: true,
            isPasswordInvalid: false,
            password: '',
        };
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
        this.attemptPdfLoadWithPassword = this.attemptPdfLoadWithPassword.bind(this);
        this.terminatePasswordChallenge = this.terminatePasswordChallenge.bind(this);
    }

    /**
     * Initiate password challenge if message received from react-native-pdf/PDF
     * indicates that a password is required or invalid.
     *
     * For a password challenge the message is "Password required or incorrect password."
     * Note that the message doesn't specify whether the password is simply empty or
     * invalid.
     *
     * @param {String} message
     */
    initiatePasswordChallenge({message}) {
        if (!message.match(/password/i)) {
            return;
        }

        // Render password form, and don't render PDF.
        this.setState({shouldRequestPassword: true, shouldAttemptPdfLoad: false});

        // The message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (this.state.password) {
            this.setState({isPasswordInvalid: true});
        }
    }

    /**
     * When the password is submitted via PDFPasswordForm, save the password
     * in state and attempt to load the PDF.
     *
     * @param {String} password Password submitted via PDFPasswordForm
     */
    attemptPdfLoadWithPassword(password) {
        // Render react-native-pdf/PDF so that it can validate the password.
        // Note that at this point in the password challenge, shouldRequestPassword is true.
        // Thus react-native-pdf/PDF will be rendered - but not visible.
        this.setState({password, shouldAttemptPdfLoad: true});
    }

    /**
     * When the PDF is loaded after a successful password challenge,
     * hide PDFPasswordForm - and thus also make the react-native-pdf/PDF visible.
     */
    terminatePasswordChallenge() {
        // Don't render PDFPasswordForm, and thus also render the PDF in visible state.
        this.setState({shouldRequestPassword: false});
    }

    render() {
        const pdfStyles = [
            styles.imageModalPDF,
            StyleUtils.getWidthAndHeightStyle(this.props.windowWidth, this.props.windowHeight),
        ];

        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF so that it can validate the password.
        if (this.state.shouldRequestPassword && this.state.shouldAttemptPdfLoad) {
            pdfStyles.push(styles.invisible);
        }

        // For small screens force the container view to take up the full width when
        // displaying the password form.
        const containerStyles = this.state.shouldRequestPassword && this.props.isSmallScreenWidth
            ? styles.pdfPasswordForm.nativeNarrowContainer : {};

        return (
            <TouchableWithoutFeedback style={[styles.flex1, this.props.style]}>
                <View style={containerStyles}>
                    {this.state.shouldAttemptPdfLoad && (
                        <PDF
                            activityIndicator={<FullScreenLoadingIndicator />}
                            source={{uri: this.props.sourceURL}}
                            style={pdfStyles}
                            onError={this.initiatePasswordChallenge}
                            password={this.state.password}
                            onLoadComplete={this.terminatePasswordChallenge}
                        />
                    )}
                    {this.state.shouldRequestPassword && (
                        <PDFPasswordForm
                            onSubmit={this.attemptPdfLoadWithPassword}
                            isPasswordInvalid={this.state.isPasswordInvalid}
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;

export default withWindowDimensions(PDFView);
