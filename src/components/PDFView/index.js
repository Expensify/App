import 'core-js/features/array/at';
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {pdfjs} from 'react-pdf';
import _ from 'underscore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withLocalize from '@components/withLocalize';
import withThemeStyles from '@components/withThemeStyles';
import withWindowDimensions from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Log from '@libs/Log';
import variables from '@styles/variables';
import * as CanvasSize from '@userActions/CanvasSize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFViewConstants from './constants';
import PDFPasswordForm from './PDFPasswordForm';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import PDFDocument from './WebPDFDocument';

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            pageViewports: [],
            containerWidth: props.windowWidth,
            containerHeight: props.windowHeight,
            password: undefined,
            /** used to keep the PDFPasswordForm mounted (for it to maintain state) while password is being verified */
            isCheckingPassword: false,
            isPasswordInvalid: false,
            isKeyboardOpen: false,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.initiatePasswordChallenge = this.initiatePasswordChallenge.bind(this);
        this.attemptPDFLoad = this.attemptPDFLoad.bind(this);
        this.toggleKeyboardOnSmallScreens = this.toggleKeyboardOnSmallScreens.bind(this);
        this.calculatePageHeight = this.calculatePageHeight.bind(this);
        this.calculatePageWidth = this.calculatePageWidth.bind(this);
        this.getDevicePixelRatio = _.memoize(this.getDevicePixelRatio.bind(this));
        this.setListAttributes = this.setListAttributes.bind(this);

        this.documentOpenedSuccessfully = false;

        const workerURL = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
        if (pdfjs.GlobalWorkerOptions.workerSrc !== workerURL) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerURL;
        }

        this.retrieveCanvasLimits();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps);
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
                isPasswordInvalid: false,
                isCheckingPassword: false,
            });

            if (pageViewports.length) {
                this.documentOpenedSuccessfully = true;
            }
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
     * Calculate the devicePixelRatio the page should be rendered with
     * Each platform has a different default devicePixelRatio and different canvas limits, we need to verify that
     * with the default devicePixelRatio it will be able to diplay the pdf correctly, if not we must change the devicePixelRatio.
     * @param {Number} width of the page
     * @param {Number} height of the page
     * @returns {Number} devicePixelRatio for this page on this platform
     */
    getDevicePixelRatio(width, height) {
        const nbPixels = width * height;
        const ratioHeight = this.props.maxCanvasHeight / height;
        const ratioWidth = this.props.maxCanvasWidth / width;
        const ratioArea = Math.sqrt(this.props.maxCanvasArea / nbPixels);
        const ratio = Math.min(ratioHeight, ratioArea, ratioWidth);

        return ratio > window.devicePixelRatio ? undefined : ratio;
    }

    /**
     * Calculates a proper page height. The method should be called only when there are page viewports.
     * It is based on a ratio between the specific page viewport width and provided page width.
     * Also, the app should take into account the page borders.
     * @param {Number} pageIndex
     * @returns {Number}
     */
    calculatePageHeight(pageIndex) {
        if (this.state.pageViewports.length === 0 || _.some(this.state.pageViewports, (viewport) => !viewport)) {
            Log.warn('Dev error: calculatePageHeight() in PDFView called too early');

            return 0;
        }

        const pageViewport = this.state.pageViewports[pageIndex];
        const pageWidth = this.calculatePageWidth();
        const scale = pageWidth / pageViewport.width;
        const actualHeight = pageViewport.height * scale + PDFViewConstants.PAGE_BORDER * 2;

        return actualHeight;
    }

    /**
     * Calculates a proper page width.
     * It depends on a screen size. Also, the app should take into account the page borders.
     * @returns {Number}
     */
    calculatePageWidth() {
        const pdfContainerWidth = this.state.containerWidth;
        const pageWidthOnLargeScreen = Math.min(pdfContainerWidth - PDFViewConstants.LARGE_SCREEN_SIDE_SPACING * 2, variables.pdfPageMaxWidth);
        const pageWidth = this.props.isSmallScreenWidth ? this.state.containerWidth : pageWidthOnLargeScreen;

        return pageWidth + PDFViewConstants.PAGE_BORDER * 2;
    }

    /**
     * Initiate password challenge process. The WebPDFDocument
     * component calls this handler to indicate that a PDF requires a
     * password, or to indicate that a previously provided password was
     * invalid.
     *
     * The PasswordResponses constants used below were copied from react-pdf
     * because they're not exported in entry.webpack.
     *
     * @param {Number} reason Reason code for password request
     */
    initiatePasswordChallenge(reason) {
        if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            this.setState({password: PDFViewConstants.REQUIRED_PASSWORD_MISSING, isCheckingPassword: false});
        } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            this.setState({password: PDFViewConstants.REQUIRED_PASSWORD_MISSING, isPasswordInvalid: true, isCheckingPassword: false});
        }
    }

    /**
     * Send password to react-pdf via its callback so that it can attempt to load
     * the PDF.
     *
     * @param {String} password Password to send via callback to react-pdf
     */
    attemptPDFLoad(password) {
        this.setState({password, isCheckingPassword: true});
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
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    retrieveCanvasLimits() {
        if (!this.props.maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }

        if (!this.props.maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }

        if (!this.props.maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
    }

    renderPDFView() {
        const styles = this.props.themeStyles;
        const pageWidth = this.calculatePageWidth();
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        const pdfContainerStyle = [styles.PDFView, styles.noSelect, this.props.style];
        // If we're requesting a password then we need to hide - but still render -
        // the PDF component.
        if (this.state.password === PDFViewConstants.REQUIRED_PASSWORD_MISSING || this.state.isCheckingPassword) {
            pdfContainerStyle.push(styles.invisible);
        }

        const estimatedItemSize = this.calculatePageHeight(0);

        return (
            <View style={outerContainerStyle}>
                <View
                    tabIndex={0}
                    style={pdfContainerStyle}
                    onLayout={({
                        nativeEvent: {
                            layout: {width, height},
                        },
                    }) => this.setState({containerWidth: width, containerHeight: height})}
                >
                    <PDFDocument
                        listStyle={styles.PDFViewList}
                        errorLabelStyles={this.props.errorLabelStyles}
                        translate={this.props.translate}
                        sourceURL={this.props.sourceURL}
                        onDocumentLoadSuccess={this.onDocumentLoadSuccess}
                        pageViewportsLength={this.state.pageViewports.length}
                        setListAttributes={this.setListAttributes}
                        isSmallScreenWidth={this.props.isSmallScreenWidth}
                        containerWidth={this.state.containerWidth}
                        containerHeight={this.state.containerHeight}
                        numPages={this.state.numPages}
                        calculatePageHeight={this.calculatePageHeight}
                        getDevicePixelRatio={this.getDevicePixelRatio}
                        estimatedItemSize={estimatedItemSize}
                        pageWidth={pageWidth}
                        password={this.state.password}
                        initiatePasswordChallenge={this.initiatePasswordChallenge}
                    />
                </View>
                {(this.state.password === PDFViewConstants.REQUIRED_PASSWORD_MISSING || this.state.isCheckingPassword) && (
                    <PDFPasswordForm
                        shouldShowLoadingIndicator={this.state.isCheckingPassword}
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
        const styles = this.props.themeStyles;
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

export default compose(
    withLocalize,
    withWindowDimensions,
    withThemeStyles,
    withOnyx({
        maxCanvasArea: {
            key: ONYXKEYS.MAX_CANVAS_AREA,
        },
        maxCanvasHeight: {
            key: ONYXKEYS.MAX_CANVAS_HEIGHT,
        },
        maxCanvasWidth: {
            key: ONYXKEYS.MAX_CANVAS_WIDTH,
        },
    }),
)(PDFView);
