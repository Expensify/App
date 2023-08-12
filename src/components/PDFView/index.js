import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import 'core-js/features/array/at';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack';
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import {VariableSizeList as List} from 'react-window';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import CONST from '../../CONST';
import PDFPasswordForm from './PDFPasswordForm';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import withLocalize from '../withLocalize';
import Text from '../Text';
import compose from '../../libs/compose';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import Log from '../../libs/Log';

/**
 * Each page has a default border. The app should take this size into account
 * when calculates the page width and height.
 */
const PAGE_BORDER = 9;
/**
 * Pages should be more narrow than the container on large screens. The app should take this size into account
 * when calculates the page width.
 */
const LARGE_SCREEN_SIDE_SPACING = 40;

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            pageViewports: [],
            containerWidth: props.windowWidth,
            containerHeight: props.windowHeight,
            shouldRequestPassword: false,
            isPasswordInvalid: false,
            isKeyboardOpen: false,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
        this.attemptPDFLoad = this.attemptPDFLoad.bind(this);
        this.toggleKeyboardOnSmallScreens = this.toggleKeyboardOnSmallScreens.bind(this);
        this.calculatePageHeight = this.calculatePageHeight.bind(this);
        this.calculatePageWidth = this.calculatePageWidth.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.setListAttributes = this.setListAttributes.bind(this);

        const workerBlob = new Blob([pdfWorkerSource], {type: 'text/javascript'});
        pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
    }

    componentDidUpdate(prevProps) {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!this.state.isKeyboardOpen && this.props.windowHeight < prevProps.windowHeight - 100) {
            this.toggleKeyboardOnSmallScreens(true);
        } else if (this.state.isKeyboardOpen && this.props.windowHeight > prevProps.windowHeight) {
            this.toggleKeyboardOnSmallScreens(false);
        }
    }

    /**
     * Upon successful document load, combine an array of page viewports,
     * set the number of pages on PDF,
     * hide/reset PDF password form, and notify parent component that
     * user input is no longer required.
     *
     * @param {Object} pdf - The PDF file instance
     * @param {Number} pdf.numPages - Number of pages of the PDF file
     * @param {Function} pdf.getPage - A method to get page by its number. It requires to have the context. It should be the pdf itself.
     * @memberof PDFView
     */
    onDocumentLoadSuccess(pdf) {
        const {numPages} = pdf;

        Promise.all(
            _.times(numPages, (index) => {
                const pageNumber = index + 1;

                return pdf.getPage(pageNumber).then((page) => page.getViewport({scale: 1}));
            }),
        ).then((pageViewports) => {
            this.setState({
                pageViewports,
                numPages,
                shouldRequestPassword: false,
                isPasswordInvalid: false,
            });
        });
    }

    /**
     * Sets attributes to list container.
     * It unblocks a default scroll by keyboard of browsers.
     * @param {Object|undefined} ref
     */
    setListAttributes(ref) {
        if (!ref) {
            return;
        }

        // Useful for elements that should not be navigated to directly using the "Tab" key,
        // but need to have keyboard focus set to them.
        // eslint-disable-next-line no-param-reassign
        ref.tabIndex = -1;
    }

    /**
     * Calculates a proper page height. The method should be called only when there are page viewports.
     * It is based on a ratio between the specific page viewport width and provided page width.
     * Also, the app should take into account the page borders.
     * @param {Number} pageIndex
     * @returns {Number}
     */
    calculatePageHeight(pageIndex) {
        if (this.state.pageViewports.length === 0) {
            Log.warn('Dev error: calculatePageHeight() in PDFView called too early');

            return 0;
        }

        const pageViewport = this.state.pageViewports[pageIndex];
        const pageWidth = this.calculatePageWidth();
        const scale = pageWidth / pageViewport.width;
        const actualHeight = pageViewport.height * scale + PAGE_BORDER * 2;

        return actualHeight;
    }

    /**
     * Calculates a proper page width.
     * It depends on a screen size. Also, the app should take into account the page borders.
     * @returns {Number}
     */
    calculatePageWidth() {
        const pdfContainerWidth = this.state.containerWidth;
        const pageWidthOnLargeScreen = Math.min(pdfContainerWidth - LARGE_SCREEN_SIDE_SPACING * 2, variables.pdfPageMaxWidth);
        const pageWidth = this.props.isSmallScreenWidth ? this.state.containerWidth : pageWidthOnLargeScreen;

        return pageWidth + PAGE_BORDER * 2;
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
     * @param {Function} callback Callback used to send password to react-pdf
     * @param {Number} reason Reason code for password request
     */
    initiatePasswordChallenge(callback, reason) {
        this.onPasswordCallback = callback;

        if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            this.setState({shouldRequestPassword: true});
        } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            this.setState({shouldRequestPassword: true, isPasswordInvalid: true});
        }
    }

    /**
     * Send password to react-pdf via its callback so that it can attempt to load
     * the PDF.
     *
     * @param {String} password Password to send via callback to react-pdf
     */
    attemptPDFLoad(password) {
        this.onPasswordCallback(password);
    }

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param {Boolean} isKeyboardOpen True if keyboard is open
     */
    toggleKeyboardOnSmallScreens(isKeyboardOpen) {
        if (!this.props.isSmallScreenWidth) {
            return;
        }
        this.setState({isKeyboardOpen});
        this.props.onToggleKeyboard(isKeyboardOpen);
    }

    /**
     * Render a specific page based on its index.
     * The method includes a wrapper to apply virtualized styles.
     * @param {Object} page item object of the List
     * @param {Number} page.index index of the page
     * @param {Object} page.style virtualized styles
     * @returns {JSX.Element}
     */
    renderPage({index, style}) {
        const pageWidth = this.calculatePageWidth();

        return (
            <View style={style}>
                <Page
                    key={`page_${index}`}
                    width={pageWidth}
                    pageIndex={index}
                    // This needs to be empty to avoid multiple loading texts which show per page and look ugly
                    // See https://github.com/Expensify/App/issues/14358 for more details
                    loading=""
                />
            </View>
        );
    }

    renderPDFView() {
        const pageWidth = this.calculatePageWidth();
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        // If we're requesting a password then we need to hide - but still render -
        // the PDF component.
        const pdfContainerStyle = this.state.shouldRequestPassword
            ? [styles.PDFView, styles.noSelect, this.props.style, styles.invisible]
            : [styles.PDFView, styles.noSelect, this.props.style];

        return (
            <View style={outerContainerStyle}>
                <View
                    focusable
                    style={pdfContainerStyle}
                    onLayout={({
                        nativeEvent: {
                            layout: {width, height},
                        },
                    }) => this.setState({containerWidth: width, containerHeight: height})}
                >
                    <Document
                        error={<Text style={[styles.textLabel, styles.textLarge]}>{this.props.translate('attachmentView.failedToLoadPDF')}</Text>}
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
                        {this.state.pageViewports.length > 0 && (
                            <List
                                outerRef={this.setListAttributes}
                                style={styles.PDFViewList}
                                width={this.props.isSmallScreenWidth ? pageWidth : this.state.containerWidth}
                                height={this.state.containerHeight}
                                estimatedItemSize={this.calculatePageHeight(0)}
                                itemCount={this.state.numPages}
                                itemSize={this.calculatePageHeight}
                            >
                                {this.renderPage}
                            </List>
                        )}
                    </Document>
                </View>
                {this.state.shouldRequestPassword && (
                    <PDFPasswordForm
                        isFocused={this.props.isFocused}
                        onSubmit={this.attemptPDFLoad}
                        onPasswordUpdated={() => this.setState({isPasswordInvalid: false})}
                        isPasswordInvalid={this.state.isPasswordInvalid}
                        onPasswordFieldFocused={this.toggleKeyboardOnSmallScreens}
                    />
                )}
            </View>
        );
    }

    render() {
        return this.props.onPress ? (
            <PressableWithoutFeedback
                onPress={this.props.onPress}
                style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={this.props.fileName || this.props.translate('attachmentView.unknownFilename')}
            >
                {this.renderPDFView()}
            </PressableWithoutFeedback>
        ) : (
            this.renderPDFView()
        );
    }
}

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default compose(withLocalize, withWindowDimensions)(PDFView);
