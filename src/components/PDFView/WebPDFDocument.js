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
                {pageViewportsLength && (
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
WebPDFDocument.propTypes = {
    /** Index of the PDF page to be displayed passed by VariableSizeList */
    errorLabelStyles: stylePropTypes,
    translate: PropTypes.func.isRequired,
    sourceURL: PropTypes.string.isRequired,
    onDocumentLoadSuccess: PropTypes.func.isRequired,
    pageViewportsLength: PropTypes.number.isRequired,
    setListAttributes: PropTypes.func.isRequired,
    isSmallScreenWidth: PropTypes.bool.isRequired,
    containerHeight: PropTypes.number.isRequired,
    containerWidth: PropTypes.number.isRequired,
    numPages: PropTypes.number,
    calculatePageHeight: PropTypes.func.isRequired,
    getDevicePixelRatio: PropTypes.func.isRequired,
    estimatedItemSize: PropTypes.number.isRequired,
    pageWidth: PropTypes.number.isRequired,
    listStyle: stylePropTypes,
    initiatePasswordChallenge: PropTypes.func.isRequired,
    // the password property can be null or undefined, indicating an entirely different state on purpose
    // eslint-disable-next-line react/require-default-props
    password: PropTypes.string,
};
WebPDFDocument.defaultProps = {
    errorLabelStyles: [],
    numPages: null,
    listStyle: undefined,
};

export default WebPDFDocument;
