import React, {Component} from 'react';
import {View} from 'react-native';
import PDF from 'react-native-pdf';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import Text from '../Text';
import PDFPasswordForm from './PDFPasswordForm';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import {propTypes as pdfViewPropTypes, defaultProps} from './pdfViewPropTypes';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import withLocalize from '../withLocalize';
import CONST from '../../CONST';
const propTypes = {
    ...pdfViewPropTypes,
    ...keyboardStatePropTypes,
}
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

const [shouldRequestPassword, setShouldRequestPassword] = useState(false);
const [shouldAttemptPDFLoad, setShouldAttemptPDFLoad] = useState(true);
const [shouldShowLoadingIndicator, setShouldShowLoadingIndicator] = useState(true),
const [isPasswordInvalid, setIsPasswordInvalid] = useState(false),
const [failedToLoadPDF, setFailedToLoadPDF] = useState(false),
const [successToLoadPDF, setSuccessToLoadPDF] = useState(false),
const [password, setPassword] = useState(''),


/* Ignoring this for last.*/
componentDidUpdate() {
   props .onToggleKeyboard(props.isKeyboardShown);
}



function PDFView(props) {
    /**
     * Initiate password challenge if message received from react-native-pdf/PDF
     * indicates that a password is required or invalid.
     *
     * For a password challenge the message is "Password required or incorrect password."
     * Note that the message doesn't specify whether the password is simply empty or
     * invalid.
     */
    function initiatePasswordChallenge() {
        setShouldShowLoadingIndicator(false);
        setShouldRequestPassword(true);
        setShouldAttemptPDFLoad(false);
        // The message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (password !== '') {
            setIsPasswordInvalid(true);
        }
    }

    function handleFailureToLoadPDF(error) {
        if (error.message.match(/password/i)) {
            initiatePasswordChallenge();
            return;
        };
        setFailedToLoadPDF(true);
        setShouldShowLoadingIndicator(false);
        setShouldRequestPassword(false);
        setShouldAttemptPDFLoad(false);
    }

    /**
     * When the password is submitted via PDFPasswordForm, save the password
     * in state and attempt to load the PDF. Also show the loading indicator
     * since react-native-pdf/PDF will need to reload the PDF.
     *
     * @param {String} password Password submitted via PDFPasswordForm
     */
    function attemptPDFLoadWithPassword(password) {
        // Render react-native-pdf/PDF so that it can validate the password.
        // Note that at this point in the password challenge, shouldRequestPassword is true.
        // Thus react-native-pdf/PDF will be rendered - but not visible.
        setPassword(password),
        setShouldAttemptPDFLoad(true);
        setShouldShowLoadingIndicator(true);

    }
        

        /**
         * After the PDF is successfully loaded hide PDFPasswordForm and the loading
         * indicator.
         */
        finishPDFLoad() {
            setShouldRequestPassword(false);
            setShouldShowLoadingIndicator(false);
            setsuccessToLoadPDF(true);
            props.onLoadComplete();
        }

    renderPDFView() {
        const pdfStyles = [styles.imageModalPDF, StyleUtils.getWidthAndHeightStyle(props.windowWidth, props.windowHeight)];

        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF component so that it can validate the password.
        if (shouldRequestPassword) {
            pdfStyles.push(styles.invisible);
        }

        const containerStyles = shouldRequestPassword && props.isSmallScreenWidth ? [styles.w100, styles.flex1] : [styles.alignItemsCenter, styles.flex1];

        return (
            <View style={containerStyles}>
                {failedToLoadPDF && (
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text style={[styles.textLabel, styles.textLarge]}>{props.translate('attachmentView.failedToLoadPDF')}</Text>
                    </View>
                )}
                {shouldAttemptPDFLoad && (
                    <PDF
                        trustAllCerts={false}
                        renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                        source={{uri: props.sourceURL}}
                        style={pdfStyles}
                        onError={handleFailureToLoadPDF}
                        password={state.password}
                        onLoadComplete={finishPDFLoad}
                        onPageSingleTap={props.onPress}
                        onScaleChanged={props.onScaleChanged}
                    />
                )}
                {this.state.shouldRequestPassword && (
                    <KeyboardAvoidingView style={styles.flex1}>
                        <PDFPasswordForm
                            isFocused={props.isFocused}
                            onSubmit={attemptPDFLoadWithPassword}
                            onPasswordUpdated={() => setIsPasswordInvalid(false)}
                            isPasswordInvalid={isPasswordInvalid}
                            shouldShowLoadingIndicator={shouldShowLoadingIndicator}
                        />
                    </KeyboardAvoidingView>
                )}
            </View>
        );
    }

    return props.onPress && !successToLoadPDF ? (
        <PressableWithoutFeedback
            onPress={props.onPress}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={props.fileName || props.translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;

export default compose(withWindowDimensions, withKeyboardState, withLocalize)(PDFView);
