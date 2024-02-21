import 'core-js/features/array/at';
import PropTypes from 'prop-types';
import React, {memo, useCallback} from 'react';
import {Document} from 'react-pdf';
import {VariableSizeList as List} from 'react-window';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Text from '@components/Text';
import stylePropTypes from '@styles/stylePropTypes';
import CONST from '@src/CONST';
import PageRenderer from './WebPDFPageRenderer';

const propTypes = {
    /** Index of the PDF page to be displayed passed by VariableSizeList */
    errorLabelStyles: stylePropTypes,
    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
    /** The source URL from which to load PDF file to be displayed */
    sourceURL: PropTypes.string.isRequired,
    /** Callback invoked when the PDF document is loaded successfully */
    onDocumentLoadSuccess: PropTypes.func.isRequired,
    /** Viewport info of all PDF pages */
    pageViewportsLength: PropTypes.number.isRequired,
    /** Sets attributes to list container */
    setListAttributes: PropTypes.func.isRequired,
    /** Indicates, whether the screen is of small width */
    isSmallScreenWidth: PropTypes.bool.isRequired,
    /** Height of PDF document container view */
    containerHeight: PropTypes.number.isRequired,
    /** Width of PDF document container view */
    containerWidth: PropTypes.number.isRequired,
    /** The number of pages of the PDF file to be rendered */
    numPages: PropTypes.number,
    /** Function that calculates the height of a page of the PDF document */
    calculatePageHeight: PropTypes.func.isRequired,
    /** Function that calculates the devicePixelRatio the page should be rendered with */
    getDevicePixelRatio: PropTypes.func.isRequired,
    /** The estimated height of a single PDF page for virtualized rendering purposes */
    estimatedItemSize: PropTypes.number.isRequired,
    /** The width of a page in the PDF file */
    pageWidth: PropTypes.number.isRequired,
    /** The style applied to the list component */
    listStyle: stylePropTypes,
    /** Function that should initiate that the user should be prompted for password to the PDF file */
    initiatePasswordChallenge: PropTypes.func.isRequired,
    /** Either:
     * - `string` - the password provided by the user to unlock the PDF file
     * - `undefined` if password isn't needed to view the PDF file
     * - `null` if the password is required but hasn't been provided yet */
    password: PropTypes.string,
};

const defaultProps = {
    errorLabelStyles: [],
    numPages: null,
    listStyle: undefined,
    password: undefined,
};

const WebPDFDocument = memo(
    ({
        errorLabelStyles,
        translate,
        sourceURL,
        onDocumentLoadSuccess,
        pageViewportsLength,
        setListAttributes,
        isSmallScreenWidth,
        containerHeight,
        containerWidth,
        numPages,
        calculatePageHeight,
        getDevicePixelRatio,
        estimatedItemSize,
        pageWidth,
        listStyle,
        initiatePasswordChallenge,
        password,
    }) => {
        const onPassword = useCallback(
            (callback, reason) => {
                if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.NEED_PASSWORD) {
                    if (password) {
                        callback(password);
                    } else {
                        initiatePasswordChallenge(reason);
                    }
                } else if (reason === CONST.PDF_PASSWORD_FORM.REACT_PDF_PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
                    initiatePasswordChallenge(reason);
                }
            },
            [password, initiatePasswordChallenge],
        );

        return (
            <Document
                loading={<FullScreenLoadingIndicator />}
                error={<Text style={errorLabelStyles}>{translate('attachmentView.failedToLoadPDF')}</Text>}
                file={sourceURL}
                options={{
                    cMapUrl: 'cmaps/',
                    cMapPacked: true,
                }}
                externalLinkTarget="_blank"
                onLoadSuccess={onDocumentLoadSuccess}
                onPassword={onPassword}
            >
                {!!pageViewportsLength && (
                    <List
                        outerRef={setListAttributes}
                        style={listStyle}
                        width={isSmallScreenWidth ? pageWidth : containerWidth}
                        height={containerHeight}
                        estimatedItemSize={estimatedItemSize}
                        itemCount={numPages}
                        itemSize={calculatePageHeight}
                        itemData={{pageWidth, calculatePageHeight, getDevicePixelRatio, estimatedItemSize}}
                    >
                        {PageRenderer}
                    </List>
                )}
            </Document>
        );
    },
    (prevProps, nextProps) => _.isEqual(prevProps, nextProps),
);

WebPDFDocument.displayName = 'WebPDFDocument';
WebPDFDocument.propTypes = propTypes;
WebPDFDocument.defaultProps = defaultProps;

export default WebPDFDocument;
