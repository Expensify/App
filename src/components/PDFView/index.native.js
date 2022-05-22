import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {TouchableWithoutFeedback} from 'react-native';
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
 * On the native layer, we use a pdf library to display PDFs
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const PDFView = (props) => {
    const [requestPassword, setRequestPassword] = useState(false);
    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const [password, setPassword] = useState('');

    /**
     * The react-native-pdf/PDF calls this handler when a password is required,
     * or if the specified password is invalid.
     *
     * The message is "Password required or incorrect password." Note that the message
     * doesn't specify whether the password is simply empty or rather invalid.
     *
     * @param {Object} error
     */
    const onError = (error) => {
        if (!error.message.match(/password/i)) {
            return;
        }

        setRequestPassword(true);

        // The error message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (password) {
            setPasswordInvalid(true);
        }
    };

    /**
     * Handler called by PDFPasswordForm when the password form is submitted.
     *
     * @param {string} submittedPassword Password submitted in PDFPasswordForm
     */
    const onPasswordFormSubmit = (submittedPassword) => {
        setPassword(submittedPassword);
        setRequestPassword(false);
    };

    return (
        <TouchableWithoutFeedback style={[styles.flex1, props.style]}>

            {requestPassword ? (
                <PDFPasswordForm
                    onSubmit={onPasswordFormSubmit}
                    passwordInvalid={passwordInvalid}
                />
            ) : (
                <PDF
                    activityIndicator={<FullScreenLoadingIndicator />}
                    source={{uri: props.sourceURL}}
                    style={[
                        styles.imageModalPDF,
                        StyleUtils.getWidthAndHeightStyle(props.windowWidth, props.windowHeight),
                    ]}
                    onError={error => onError(error)}
                    password={password}
                />
            )}

        </TouchableWithoutFeedback>
    );
};

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
