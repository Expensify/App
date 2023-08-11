import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as ReceiptUtils from '../libs/ReceiptUtils';
import RenderHTML from './RenderHTML';
import stylePropTypes from '../styles/stylePropTypes';
import Text from './Text';

const propTypes = {
    /** array of image URIs */
    images: PropTypes.arrayOf(PropTypes.shape({
        source: PropTypes.string,
        filename: PropTypes.string,
    })),

    /** max number of images to show in the row */
    size: PropTypes.number,

    /** optional: total number of images */
    total: PropTypes.number,

    hoverStyle: stylePropTypes,
};

const defaultProps = {
    images: [],
    size: 0,
    total: 0,
    hoverStyle: {},
};

function ReceiptImages(props) {
    const images = props.images.slice(0, props.size);
    const remaining = props.total - props.size;

    return (
        <View style={[styles.reportPreviewBoxReceipts, props.hoverStyle]}>
            {_.map(images, ({source, filename}, index) => {
                const {thumbnail, image} = ReceiptUtils.getThumbnailAndImageURIs(source, filename);
                const isLastImage = index === props.size - 1;
                return (
                    <View
                        key={source}
                        style={[styles.reportPreviewBoxReceipt, props.hoverStyle]}
                    >
                        {thumbnail
                            ? <RenderHTML html={`
                                    <img
                                        src="${thumbnail}"
                                        data-expensify-source="${image}"
                                        data-expensify-fit-container="true"
                                        data-expensify-preview-modal-disabled="true"
                                    />
                            `} />
                            : <Image source={{uri: image}} style={[styles.w100, styles.h100]} />
                        }
                        {isLastImage && remaining > 0 && (
                            <View style={[styles.reportPreviewBoxReceiptsMore, props.hoverStyle]}>
                                <Text>+{remaining}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    )
}

ReceiptImages.propTypes = propTypes;
ReceiptImages.defaultProps = defaultProps;
ReceiptImages.displayName = 'ReceiptImages';

export default ReceiptImages;