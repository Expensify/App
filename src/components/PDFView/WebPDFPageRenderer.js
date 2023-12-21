import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {View} from 'react-native';
import {Page} from 'react-pdf';
import _ from 'underscore';
import stylePropTypes from '@styles/stylePropTypes';
import PDFViewConstants from './constants';

const propTypes = {
    /** Index of the PDF page to be displayed passed by VariableSizeList */
    index: PropTypes.number.isRequired,

    /** Page extra data passed by VariableSizeList's data prop */
    data: PropTypes.shape({
        /** Width of a single page in the document */
        pageWidth: PropTypes.number.isRequired,
        /** Function that calculates the height of a page given its index */
        calculatePageHeight: PropTypes.func.isRequired,
        /** Function that calculates the pixel ratio for a page given its calculated width and height */
        getDevicePixelRatio: PropTypes.func.isRequired,
        /** The estimated height of a single page in the document */
        estimatedItemSize: PropTypes.number.isRequired,
    }).isRequired,

    /** Additional style props passed by VariableSizeList */
    style: stylePropTypes.isRequired,
};

const WebPDFPageRenderer = memo(
    ({index: pageIndex, data, style}) => {
        const {pageWidth, calculatePageHeight, getDevicePixelRatio, estimatedItemSize} = data;

        const pageHeight = calculatePageHeight(pageIndex);
        const devicePixelRatio = getDevicePixelRatio(pageWidth, pageHeight);

        return (
            <View style={{...style, top: `${parseFloat(style.top) + PDFViewConstants.PAGE_BORDER}px`}}>
                <Page
                    key={`page_${pageIndex}`}
                    width={pageWidth}
                    height={pageHeight || estimatedItemSize}
                    pageIndex={pageIndex}
                    // This needs to be empty to avoid multiple loading texts which show per page and look ugly
                    // See https://github.com/Expensify/App/issues/14358 for more details
                    loading=""
                    devicePixelRatio={devicePixelRatio}
                />
            </View>
        );
    },
    (prevProps, nextProps) => _.isEqual(prevProps, nextProps),
);

WebPDFPageRenderer.displayName = 'WebPDFPageRenderer';
WebPDFPageRenderer.propTypes = propTypes;

export default WebPDFPageRenderer;
