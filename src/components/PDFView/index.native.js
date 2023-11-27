import React, {Component} from 'react';
import {View} from 'react-native';
import PDF from 'react-native-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withKeyboardState, {keyboardStatePropTypes} from '@components/withKeyboardState';
import withLocalize from '@components/withLocalize';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import withWindowDimensions from '@components/withWindowDimensions';
import compose from '@libs/compose';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';
import PDFPasswordForm from './PDFPasswordForm';
import {defaultProps, propTypes as pdfViewPropTypes} from './pdfViewPropTypes';

const propTypes = {
    ...pdfViewPropTypes,
    ...keyboardStatePropTypes,
    ...withThemeStylesPropTypes,
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
            successToLoadPDF: false,
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
            shouldRequestPassword: false,
            shouldShowLoadingIndicator: false,
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
            successToLoadPDF: true,
        });
        this.props.onLoadComplete();
    }

    renderPDFView() {
        const pdfStyles = [this.props.themeStyles.imageModalPDF, StyleUtils.getWidthAndHeightStyle(this.props.windowWidth, this.props.windowHeight)];

        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF component so that it can validate the password.
        if (this.state.shouldRequestPassword) {
            pdfStyles.push(this.props.themeStyles.invisible);
        }

        const containerStyles =
            this.state.shouldRequestPassword && this.props.isSmallScreenWidth
                ? [this.props.themeStyles.w100, this.props.themeStyles.flex1]
                : [this.props.themeStyles.alignItemsCenter, this.props.themeStyles.flex1];

        return (
            <View style={containerStyles}>
                {this.state.failedToLoadPDF && (
                    <View style={[this.props.themeStyles.flex1, this.props.themeStyles.justifyContentCenter]}>
                        <Text style={this.props.errorLabelStyles}>{this.props.translate('attachmentView.failedToLoadPDF')}</Text>
                    </View>
                )}
                {this.state.shouldAttemptPDFLoad && (
                    <PDF
                        fitPolicy={0}
                        trustAllCerts={false}
                        renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                        source={{uri: this.props.sourceURL}}
                        style={pdfStyles}
                        onError={this.handleFailureToLoadPDF}
                        password={this.state.password}
                        onLoadComplete={this.finishPDFLoad}
                        onPageSingleTap={this.props.onPress}
                        onScaleChanged={this.props.onScaleChanged}
                    />
                )}

                {this.state.shouldRequestPassword && (
                    <KeyboardAvoidingView style={this.props.themeStyles.flex1}>
                        <PDFPasswordForm
                            isFocused={this.props.isFocused}
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

    render() {
        return this.props.onPress && !this.state.successToLoadPDF ? (
            <PressableWithoutFeedback
                onPress={this.props.onPress}
                style={[this.props.themeStyles.flex1, this.props.themeStyles.flexRow, this.props.themeStyles.alignSelfStretch]}
                role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={this.props.fileName || this.props.translate('attachmentView.unknownFilename')}
            >
                {this.renderPDFView()}
            </PressableWithoutFeedback>
        ) : (
            this.renderPDFView()
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;

export default compose(withWindowDimensions, withKeyboardState, withLocalize, withThemeStyles)(PDFView);
