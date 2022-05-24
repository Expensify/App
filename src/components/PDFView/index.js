import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import {Document, Page} from 'react-pdf/dist/esm/entry.webpack';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import variables from '../../styles/variables';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';
import Log from '../../libs/Log';
import CONST from '../../CONST';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    ...windowDimensionsPropTypes,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Notify parent that we're requesting input from user */
    onUserInputRequired: PropTypes.func,
};

const defaultProps = {
    sourceURL: '',
    style: {},
    onUserInputRequired: () => {},
};

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            windowWidth: Dimensions.get('window').width,
            shouldRequestPassword: true,
            isPasswordInvalid: false,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
    }

    /**
     * Upon successful document load, set the number of pages on PDF,
     * hide/reset PDF password form, and notify parent component that
     * user input is no longer required.
     *
     * @param {*} {numPages} No of pages in the rendered PDF
     * @memberof PDFView
     */
    onDocumentLoadSuccess({numPages}) {
        this.setState({
            numPages,
            shouldRequestPassword: false,
            isPasswordInvalid: false,
        });
        this.props.onUserInputRequired(false);
    }

    /**
     * Initiate password challenge process. The react-pdf/Document
     * component calls this handler to indicate that a PDF requires a
     * password, or to indicate that a previously provided password was
     * invalid.
     *
     * The PasswordResponses constants used below were copied from react-pdf
     * because they're not exported in entry.webpack.
     *
     * @param {*} callback Callback used to send password to react-pdf
     * @param {Number} reason Reason code for password request
     */
    initiatePasswordChallenge(callback, reason) {
        this.onPasswordCallback = callback;

        if (reason === CONST.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            this.setState({shouldRequestPassword: true});
            this.props.onUserInputRequired(true);
        } else if (reason === CONST.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            this.setState({shouldRequestPassword: true, isPasswordInvalid: true});
            this.props.onUserInputRequired(true);
        } else {
            Log.warn('[PDFView] pdf password requested for unknown reason: ', reason);
        }
    }

    render() {
        const pdfContainerWidth = this.state.windowWidth - 100;
        const pageWidthOnLargeScreen = (pdfContainerWidth <= variables.pdfPageMaxWidth)
            ? pdfContainerWidth : variables.pdfPageMaxWidth;
        const pageWidth = this.props.isSmallScreenWidth ? this.state.windowWidth - 30 : pageWidthOnLargeScreen;

        const pdfStyle = [styles.PDFView];
        const containerStyle = [styles.PDFView, this.props.style];

        // If we're requesting a password then we need to set the background to
        // defaultModalContainer color (white) and hide - but still render -
        // the PDF component.
        if (this.state.shouldRequestPassword) {
            pdfStyle.push(styles.invisible);
            containerStyle.push(styles.defaultModalContainer);
        }

        return (

            <View
                style={containerStyle}
                onLayout={event => this.setState({windowWidth: event.nativeEvent.layout.width})}
            >
                <View style={pdfStyle}>
                    <Document
                        loading={<FullScreenLoadingIndicator />}
                        file={this.props.sourceURL}
                        options={{
                            cMapUrl: 'cmaps/',
                            cMapPacked: true,
                        }}
                        externalLinkTarget="_blank"
                        onLoadSuccess={this.onDocumentLoadSuccess}
                        onPassword={this.initiatePasswordChallenge}
                    >
                        {_.map(_.range(this.state.numPages), (v, index) => (
                            <Page
                                width={pageWidth}
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                            />
                        ))}

                    </Document>
                </View>

                {this.state.shouldRequestPassword && (
                    <PDFPasswordForm
                        onSubmit={password => this.onPasswordCallback(password)}
                        isPasswordInvalid={this.state.isPasswordInvalid}
                    />
                )}

            </View>
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;

export default withWindowDimensions(PDFView);
