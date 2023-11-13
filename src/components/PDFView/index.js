import 'core-js/features/array/at';
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack';
import {VariableSizeList as List} from 'react-window';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withLocalize from '@components/withLocalize';
import withWindowDimensions from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Log from '@libs/Log';
import styles from '@styles/styles';
import variables from '@styles/variables';
import * as CanvasSize from '@userActions/CanvasSize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFPasswordForm from './PDFPasswordForm';
import * as pdfViewPropTypes from './pdfViewPropTypes';

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

function PDFView(props) {
    const [numPages, setNumPages] = null;
    const [pageViewports, setPageViewports] = [];
    const [containerWidth, setContainerWidth] = props.windowWidth;
    const [containerHeight, setContainerHeight] = props.windowHeight;
    const [shouldRequestPassword, setShouldRequestPassword] = false;
    const [isPasswordInvalid, setIsPasswordInvalid] = false;
    const [isKeyboardOpen, setIsKeyboardOpen] = false;

    const workerBlob = new Blob([pdfWorkerSource], {type: 'text/javascript'});
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
    retrieveCanvasLimits();


    function componentDidUpdate(prevProps) {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!isKeyboardOpen && props.windowHeight < prevProps.windowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isKeyboardOpen && props.windowHeight > prevProps.windowHeight) {
            toggleKeyboardOnSmallScreens(false);
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
    function onDocumentLoadSuccess(pdf) {
        const {numPages} = pdf;

        Promise.all(
            _.times(numPages, (index) => {
                const pageNumber = index + 1;

                return pdf.getPage(pageNumber).then((page) => page.getViewport({scale: 1}));
            }),
        ).then((pageViewports) => {
            setPageViewports();
            setNumPages();
            setShouldRequestPassword(false);
            setIsPasswordInvalid(false);
        });
    }

    /**
     * Sets attributes to list container.
     * It unblocks a default scroll by keyboard of browsers.
     * @param {Object|undefined} ref
     */
    function setListAttributes(ref) {
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
    function getDevicePixelRatio(width, height) {
        const nbPixels = width * height;
        const ratioHeight = props.maxCanvasHeight / height;
        const ratioWidth = props.maxCanvasWidth / width;
        const ratioArea = Math.sqrt(props.maxCanvasArea / nbPixels);
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
    function calculatePageHeight(pageIndex) {
        if (pageViewports.length === 0) {
            Log.warn('Dev error: calculatePageHeight() in PDFView called too early');

            return 0;
        }

        const pageViewport = pageViewports[pageIndex];
        const pageWidth = calculatePageWidth();
        const scale = pageWidth / pageViewport.width;
        const actualHeight = pageViewport.height * scale + PAGE_BORDER * 2;

        return actualHeight;
    }

    /**
     * Calculates a proper page width.
     * It depends on a screen size. Also, the app should take into account the page borders.
     * @returns {Number}
     */
    function calculatePageWidth() {
        const pdfContainerWidth = containerWidth;
        const pageWidthOnLargeScreen = Math.min(pdfContainerWidth - LARGE_SCREEN_SIDE_SPACING * 2, variables.pdfPageMaxWidth);
        const pageWidth = props.isSmallScreenWidth ? containerWidth : pageWidthOnLargeScreen;

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
    function initiatePasswordChallenge(callback, reason) {
        onPasswordCallback = callback;

        if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            setShouldRequestPassword(true);
        } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            setShouldRequestPassword(true);
            setIsPasswordInvalid(true);
        }
    }

    /**
     * Send password to react-pdf via its callback so that it can attempt to load
     * the PDF.
     *
     * @param {String} password Password to send via callback to react-pdf
     */
    function attemptPDFLoad(password) {
        onPasswordCallback(password);
    }

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param {Boolean} isKeyboardOpen True if keyboard is open
     */
    function toggleKeyboardOnSmallScreens(isKeyboardOpen) {
        if (!props.isSmallScreenWidth) {
            return;
        }
        setIsKeyboardOpen();
        props.onToggleKeyboard(isKeyboardOpen);
    }

    /**
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    function retrieveCanvasLimits() {
        if (!props.maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }

        if (!props.maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }

        if (!props.maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
    }

    /**
     * Render a specific page based on its index.
     * The method includes a wrapper to apply virtualized styles.
     * @param {Object} page item object of the List
     * @param {Number} page.index index of the page
     * @param {Object} page.style virtualized styles
     * @returns {JSX.Element}
     */
    function renderPage({index, style}) {
        const pageWidth = calculatePageWidth();
        const pageHeight = calculatePageHeight(index);
        const devicePixelRatio = getDevicePixelRatio(pageWidth, pageHeight);

        return (
            <View style={style}>
                <Page
                    key={`page_${index}`}
                    width={pageWidth}
                    pageIndex={index}
                    // This needs to be empty to avoid multiple loading texts which show per page and look ugly
                    // See https://github.com/Expensify/App/issues/14358 for more details
                    loading=""
                    devicePixelRatio={devicePixelRatio}
                />
            </View>
        );
    }

    function renderPDFView() {
        const pageWidth = calculatePageWidth();
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        // If we're requesting a password then we need to hide - but still render -
        // the PDF component.
        const pdfContainerStyle = shouldRequestPassword
            ? [styles.PDFView, styles.noSelect, props.style, styles.invisible]
            : [styles.PDFView, styles.noSelect, props.style];

        return (
            <View style={outerContainerStyle}>
                <View
                    tabIndex={0}
                    style={pdfContainerStyle}
                    onLayout={({
                        nativeEvent: {
                            layout: {width, height},
                        },
                    }) => setState({containerWidth: width, containerHeight: height})}
                >
                    <Document
                        error={<Text style={props.errorLabelStyles}>{props.translate('attachmentView.failedToLoadPDF')}</Text>}
                        loading={<FullScreenLoadingIndicator />}
                        file={props.sourceURL}
                        options={{
                            cMapUrl: 'cmaps/',
                            cMapPacked: true,
                        }}
                        externalLinkTarget="_blank"
                        onLoadSuccess={onDocumentLoadSuccess}
                        onPassword={initiatePasswordChallenge}
                    >
                        {pageViewports.length > 0 && (
                            <List
                                outerRef={setListAttributes}
                                style={styles.PDFViewList}
                                width={props.isSmallScreenWidth ? pageWidth : containerWidth}
                                height={containerHeight}
                                estimatedItemSize={calculatePageHeight(0)}
                                itemCount={state.numPages}
                                itemSize={calculatePageHeight}
                            >
                                {renderPage}
                            </List>
                        )}
                    </Document>
                </View>
                {shouldRequestPassword && (
                    <PDFPasswordForm
                        isFocused={props.isFocused}
                        onSubmit={attemptPDFLoad}
                        onPasswordUpdated={() => setIsPasswordInvalid(false)}
                        isPasswordInvalid={isPasswordInvalid}
                        onPasswordFieldFocused={toggleKeyboardOnSmallScreens}
                    />
                )}
            </View>
        );
    }


    return props.onPress ? (
        <PressableWithoutFeedback
            onPress={props.onPress}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={props.fileName || props.translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}


PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
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
    withLocalize,
    withWindowDimensions,
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
