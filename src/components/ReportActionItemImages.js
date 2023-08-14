import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import RenderHTML from './RenderHTML';
import stylePropTypes from '../styles/stylePropTypes';
import Text from './Text';

const propTypes = {
    /** array of image and thumbnail URIs */
    images: PropTypes.arrayOf(PropTypes.shape({
        thumbnail: PropTypes.string,
        image: PropTypes.string,
    })),

    /** max number of images to show in the row */
    size: PropTypes.number,

    /** optional: total number of images if different than images prop length */
    total: PropTypes.number,

    hoverStyle: stylePropTypes,
};

const defaultProps = {
    images: [],
    size: 3,
    total: 0,
    hoverStyle: {},
};

function ReportActionItemImages(props) {
    const images = props.images.slice(0, props.size);
    const remaining = (props.total || props.images.length) - props.size;

    return (
        <View style={[styles.reportActionItemImages, props.hoverStyle]}>
            {_.map(images, ({thumbnail, image}, index) => {
                const isLastImage = index === props.size - 1;
                return (
                    <View
                        key={image}
                        style={[styles.reportActionItemImage, props.hoverStyle]}
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
                            <View style={[styles.reportActionItemImagesMore, props.hoverStyle]}>
                                <Text>+{remaining}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    )
}

ReportActionItemImages.propTypes = propTypes;
ReportActionItemImages.defaultProps = defaultProps;
ReportActionItemImages.displayName = 'ReportActionItemImages';

export default ReportActionItemImages;