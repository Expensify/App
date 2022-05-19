import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import {Document, Page} from 'react-pdf/dist/esm/entry.webpack';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import variables from '../../styles/variables';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';
import Log from '../../libs/Log';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    ...windowDimensionsPropTypes,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    sourceURL: '',
    style: {},
};

class PDFView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            windowWidth: Dimensions.get('window').width,
            requestPassword: false,
            password: null,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.onPassword = this.onPassword.bind(this);
        this.onPasswordFormSubmit = this.onPasswordFormSubmit.bind(this);
    }

    /**
     * Callback to be called to set the number of pages on PDF
     *
     * @param {*} {numPages} No of pages in the rendered PDF
     * @memberof PDFView
     */
    onDocumentLoadSuccess({numPages}) {
        // console.log("load success", numPages)
        this.setState({numPages});
        this.setState({requestPassword: false, password: null});
    }

    onPassword(callback, reason) {
        const PasswordResponses = {
            NEED_PASSWORD: 1,
            INCORRECT_PASSWORD: 2,
        };

        if (reason === PasswordResponses.NEED_PASSWORD) {
            if (this.state.password) {
                // console.log("already have password - doing callback");
                callback(this.state.password);
            } else {
                // console.log("password required");
                this.setState({requestPassword: true});
                this.onPasswordCallback = callback;
            }
        } else if (reason === PasswordResponses.INCORRECT_PASSWORD) {
            // console.log("password incorrect");
            this.setState({requestPassword: true});
            this.onPasswordCallback = callback;
        } else {
            Log.warn('[PDFView] pdf password requested for unknown reason: ', reason);
        }
    }

    onPasswordFormSubmit(password) {
        // console.log("onSubmitPasswordForm", password)
        this.setState({requestPassword: false, password});
    }

    renderPasswordForm() {
        return (
            <PDFPasswordForm
                onSubmit={this.onPasswordFormSubmit}
            />
        );
    }

    render() {
        const pdfContainerWidth = this.state.windowWidth - 100;
        const pageWidthOnLargeScreen = (pdfContainerWidth <= variables.pdfPageMaxWidth)
            ? pdfContainerWidth : variables.pdfPageMaxWidth;
        const pageWidth = this.props.isSmallScreenWidth ? this.state.windowWidth - 30 : pageWidthOnLargeScreen;

        return (
            <View
                style={[styles.PDFView, this.props.style]}
                onLayout={event => this.setState({windowWidth: event.nativeEvent.layout.width})}
            >
                {this.state.requestPassword ? this.renderPasswordForm() : (
                    <Document
                        loading={<FullScreenLoadingIndicator />}
                        file={this.props.sourceURL}
                        options={{
                            cMapUrl: 'cmaps/',
                            cMapPacked: true,
                        }}
                        externalLinkTarget="_blank"
                        onLoadSuccess={this.onDocumentLoadSuccess}
                        onPassword={this.onPassword}
                    >
                        {
                            Array.from(
                                new Array(this.state.numPages),
                                (el, index) => (
                                    <Page
                                        width={pageWidth}
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                    />
                                ),
                            )
                        }
                    </Document>
                )}
            </View>
        );
    }
}

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
