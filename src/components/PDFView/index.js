import 'core-js/features/array/at';
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {pdfjs} from 'react-pdf';
import _ from 'underscore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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

function PDFView({onToggleKeyboard, fileName, onPress, isFocused, sourceURL, ...props}) {
    const {windowWidth, windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [numPages, setNumPages] = useState(null);
    const pageViewports = useRef([]);
    const [containerWidth, setContainerWidth] = useState(windowWidth);
    const [containerHeight, setContainerHeight] = useState(windowHeight);
    const [password, setPassword] = useState();
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const prevWindowHeight = usePrevious(windowHeight);

    useEffect(() => {
        const workerURL = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
        if (pdfjs.GlobalWorkerOptions.workerSrc !== workerURL) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerURL;
        }

        /**
         * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
         */
        if (!props.maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }

        if (!props.maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }

        if (!props.maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param {Boolean} isKeyboardOpened True if keyboard is opened
     */
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKeyboardOpened) => {
            if (!isSmallScreenWidth) {
                return;
            }

            setIsKeyboardOpen(isKeyboardOpened);
            onToggleKeyboard(isKeyboardOpened);
        },
        [isSmallScreenWidth, onToggleKeyboard],
    );

    useEffect(() => {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!isKeyboardOpen && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isKeyboardOpen && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to run this effect when toggleKeyboardOnSmallScreens changes
    }, [isKeyboardOpen, windowHeight, prevWindowHeight]);

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
    const onDocumentLoadSuccess = useCallback((pdf) => {
        Promise.all(
            _.times(pdf.numPages, (index) => {
                const pageNumber = index + 1;

                return pdf.getPage(pageNumber).then((page) => page.getViewport({scale: 1}));
            }),
        ).then((viewports) => {
            pageViewports.current = viewports;
            setNumPages(pdf.numPages);
            setIsPasswordInvalid(false);
            setIsCheckingPassword(false);
        });
    }, []);

    /**
     * Sets attributes to list container.
     * It unblocks a default scroll by keyboard of browsers.
     * @param {Object|undefined} ref
     */
    const setListAttributes = useCallback((ref) => {
        if (!ref) {
            return;
        }

        // Useful for elements that should not be navigated to directly using the "Tab" key,
        // but need to have keyboard focus set to them.
        // eslint-disable-next-line no-param-reassign
        ref.tabIndex = -1;
    }, []);

    /**
     * Calculate the devicePixelRatio the page should be rendered with
     * Each platform has a different default devicePixelRatio and different canvas limits, we need to verify that
     * with the default devicePixelRatio it will be able to diplay the pdf correctly, if not we must change the devicePixelRatio.
     * @param {Number} width of the page
     * @param {Number} height of the page
     * @returns {Number} devicePixelRatio for this page on this platform
     */
    const getDevicePixelRatio = useCallback(
        (width, height) => {
            const nbPixels = width * height;
            const ratioHeight = props.maxCanvasHeight / height;
            const ratioWidth = props.maxCanvasWidth / width;
            const ratioArea = Math.sqrt(props.maxCanvasArea / nbPixels);
            const ratio = Math.min(ratioHeight, ratioArea, ratioWidth);

            return ratio > window.devicePixelRatio ? undefined : ratio;
        },
        [props.maxCanvasArea, props.maxCanvasWidth, props.maxCanvasHeight],
    );

    /**
     * Calculates a proper page width.
     * It depends on a screen size. Also, the app should take into account the page borders.
     * @returns {Number}
     */
    const calculatePageWidth = useCallback(() => {
        const pdfContainerWidth = containerWidth;
        const pageWidthOnLargeScreen = Math.min(pdfContainerWidth - PDFViewConstants.LARGE_SCREEN_SIDE_SPACING * 2, variables.pdfPageMaxWidth);
        const pageWidth = isSmallScreenWidth ? containerWidth : pageWidthOnLargeScreen;

        return pageWidth + PDFViewConstants.PAGE_BORDER * 2;
    }, [containerWidth, isSmallScreenWidth]);

    /**
     * Calculates a proper page height. The method should be called only when there are page viewports.
     * It is based on a ratio between the specific page viewport width and provided page width.
     * Also, the app should take into account the page borders.
     * @param {Number} pageIndex
     * @returns {Number}
     */
    const calculatePageHeight = useCallback(
        (pageIndex) => {
            const viewports = pageViewports.current;
            if (viewports.length === 0 || _.some(viewports, (viewport) => !viewport)) {
                Log.warn('Dev error: calculatePageHeight() in PDFView called too early');

                return 0;
            }

            const pageViewport = viewports[pageIndex];
            const pageWidth = calculatePageWidth();
            const scale = pageWidth / pageViewport.width;
            const actualHeight = pageViewport.height * scale + PDFViewConstants.PAGE_BORDER * 2;

            return actualHeight;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- use numPages instead of pageViewports for avoiding infinite re-render
        [numPages, calculatePageWidth],
    );

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
    const initiatePasswordChallenge = useCallback((reason) => {
        if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
            setPassword(PDFViewConstants.REQUIRED_PASSWORD_MISSING);
            setIsCheckingPassword(false);
        } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
            setPassword(PDFViewConstants.REQUIRED_PASSWORD_MISSING);
            setIsCheckingPassword(false);
            setIsPasswordInvalid(true);
        }
    }, []);

    /**
     * Send password to react-pdf via its callback so that it can attempt to load
     * the PDF.
     *
     * @param {String} pwd Password to send via callback to react-pdf
     */
    const attemptPDFLoad = useCallback((pwd) => {
        setIsCheckingPassword(true);
        setPassword(pwd);
    }, []);

    const renderPDFView = () => {
        const viewports = pageViewports.current;
        const pageWidth = calculatePageWidth();
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        const pdfContainerStyle = [styles.PDFView, styles.noSelect, props.style];
        // If we're requesting a password then we need to hide - but still render -
        // the PDF component.
        if (password === PDFViewConstants.REQUIRED_PASSWORD_MISSING || isCheckingPassword) {
            pdfContainerStyle.push(styles.invisible);
        }

        const estimatedItemSize = calculatePageHeight(0);

        return (
            <View style={outerContainerStyle}>
                <View
                    tabIndex={0}
                    style={pdfContainerStyle}
                    onLayout={({
                        nativeEvent: {
                            layout: {width, height},
                        },
                    }) => {
                        setContainerWidth(width);
                        setContainerHeight(height);
                    }}
                >
                    <PDFDocument
                        listStyle={styles.PDFViewList}
                        errorLabelStyles={props.errorLabelStyles}
                        translate={translate}
                        sourceURL={sourceURL}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        pageViewportsLength={viewports.length}
                        setListAttributes={setListAttributes}
                        isSmallScreenWidth={isSmallScreenWidth}
                        containerWidth={containerWidth}
                        containerHeight={containerHeight}
                        numPages={numPages}
                        calculatePageHeight={calculatePageHeight}
                        getDevicePixelRatio={getDevicePixelRatio}
                        estimatedItemSize={estimatedItemSize}
                        pageWidth={pageWidth}
                        password={password}
                        initiatePasswordChallenge={initiatePasswordChallenge}
                    />
                </View>
                {(password === PDFViewConstants.REQUIRED_PASSWORD_MISSING || isCheckingPassword) && (
                    <PDFPasswordForm
                        shouldShowLoadingIndicator={isCheckingPassword}
                        isFocused={isFocused}
                        onSubmit={attemptPDFLoad}
                        onPasswordUpdated={() => setIsPasswordInvalid(false)}
                        isPasswordInvalid={isPasswordInvalid}
                        onPasswordFieldFocused={toggleKeyboardOnSmallScreens}
                    />
                )}
            </View>
        );
    };

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

PDFView.displayName = 'PDFView';
PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default compose(
    memo,
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
