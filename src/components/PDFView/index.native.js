import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {TouchableWithoutFeedback, View} from 'react-native';
import PDF from 'react-native-pdf';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: '',
    style: {},
};

/**
 * On the native layer, we use a pdf library to display PDFs. If a PDF is
 * password-protected we render a PDFPasswordForm to request a password
 * from the user.
 *
 * In order to render things nicely during a password challenge we need
 * to keep track of a bunch of additional state. In particular, the
 * react-native-pdf/PDF component is both conditionally rendered and hidden
 * depending upon the situation. It needs to be rerendered on each password
 * submission because it doesn't dynamically handle updates to it's
 * password property. And we need to hide it during password challenges
 * so that PDFPasswordForm doesn't bounce when react-native-pdf/PDF
 * is (temporarily) rendered.
 */
class PDFView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            requestPassword: false,
            passwordInvalid: false,
            password: '',
            attemptPdfLoad: true,
            pdfLoaded: false,
        };
        this.onError = this.onError.bind(this);
        this.onPasswordFormSubmit = this.onPasswordFormSubmit.bind(this);
        this.onLoadComplete = this.onLoadComplete.bind(this);
    }

    /**
     * The react-native-pdf/PDF calls this handler when a password is required,
     * or if the specified password is invalid.
     *
     * The message is "Password required or incorrect password." Note that the message
     * doesn't specify whether the password is simply empty or rather invalid.
     *
     * @param {Object} error
     */
    onError(error) {
        if (!error.message.match(/password/i)) {
            return;
        }

        // Render password form, and don't render PDF.
        this.setState({requestPassword: true, attemptPdfLoad: false});

        // The error message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (this.state.password) {
            this.setState({passwordInvalid: true});
        }
    }

    /**
     * Handler called by PDFPasswordForm when the password form is submitted.
     *
     * @param {string} submittedPassword Password submitted in PDFPasswordForm
     */
    onPasswordFormSubmit(submittedPassword) {
        // Render PDF in invisible state. It's invisible because at this
        // point in the password challenge process pdfLoaded is false.
        this.setState({password: submittedPassword, attemptPdfLoad: true});
    }

    onLoadComplete() {
        // Don't render PDFPasswordForm, and do render PDF in visible state.
        this.setState({requestPassword: false, pdfLoaded: true});
    }

    render() {
        const pdfStyles = [
            styles.imageModalPDF,
            StyleUtils.getWidthAndHeightStyle(this.props.windowWidth, this.props.windowHeight),
        ];

        // If we haven't yet successfully loaded the PDF then we need to hide the
        // react-native-pdf/PDF component so that PDFPasswordForm is positioned
        // nicely. We're just hiding it because we still need to render the PDF so
        // that it can validate the password.
        if (!this.state.pdfLoaded) {
            pdfStyles.push(styles.invisible);
        }

        return (
            <TouchableWithoutFeedback style={[styles.flex1, this.props.style]}>

                <View>

                    {this.state.attemptPdfLoad && (
                        <PDF
                            activityIndicator={<FullScreenLoadingIndicator />}
                            source={{uri: this.props.sourceURL}}
                            style={pdfStyles}
                            onError={error => this.onError(error)}
                            password={this.state.password}
                            onLoadComplete={this.onLoadComplete}
                        />
                    )}

                    {this.state.requestPassword && (
                        <PDFPasswordForm
                            onSubmit={this.onPasswordFormSubmit}
                            passwordInvalid={this.state.passwordInvalid}
                        />
                    )}

                </View>
            </TouchableWithoutFeedback>
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
