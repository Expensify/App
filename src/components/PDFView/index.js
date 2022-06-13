import _ from 'underscore';
import React, {Component} from 'react';
import {View, Dimensions} from 'react-native';
import {Document, Page} from 'react-pdf/dist/esm/entry.webpack';
import styles from '../../styles/styles';
import withWindowDimensions from '../withWindowDimensions';
import variables from '../../styles/variables';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './pdfViewPropTypes';

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            windowWidth: Dimensions.get('window').width,
            shouldRequestPassword: false,
            isPasswordInvalid: false,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
        this.attemptPdfLoad = this.attemptPdfLoad.bind(this);
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

        if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            this.setState({shouldRequestPassword: true});
            this.props.onUserInputRequired(true);
        } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            this.setState({shouldRequestPassword: true, isPasswordInvalid: true});
            this.props.onUserInputRequired(true);
        }
    }

    /**
     * Send password to react-pdf via its callback so that it can attempt to load
     * the PDF.
     *
     * @param {String} password Password to send via callback to react-pdf
     */
    attemptPdfLoad(password) {
        this.setState({isPasswordInvalid: false});
        this.onPasswordCallback(password);
    }

    render() {
        const pdfContainerWidth = this.state.windowWidth - 100;
        const pageWidthOnLargeScreen = (pdfContainerWidth <= variables.pdfPageMaxWidth)
            ? pdfContainerWidth : variables.pdfPageMaxWidth;
        const pageWidth = this.props.isSmallScreenWidth ? this.state.windowWidth - 30 : pageWidthOnLargeScreen;

        const outerContainerStyle = [styles.PDFView, this.props.style];
        const innerContainerStyle = [styles.w100, styles.h100];

        // If we're requesting a password then we need to set the background to
        // defaultModalContainer color (white) and hide - but still render -
        // the PDF component.
        if (this.state.shouldRequestPassword) {
            innerContainerStyle.push(styles.invisible);
            outerContainerStyle.push(styles.defaultModalContainer);
        }

        return (
            <View
                style={outerContainerStyle}
                onLayout={event => this.setState({windowWidth: event.nativeEvent.layout.width})}
            >
                <View style={innerContainerStyle}>
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
                        onSubmit={this.attemptPdfLoad}
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
