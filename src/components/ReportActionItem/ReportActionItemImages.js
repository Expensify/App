import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import RenderHTML from '../RenderHTML';
import stylePropTypes from '../../styles/stylePropTypes';
import Text from '../Text';
import Image from '../Image';

const propTypes = {
    /** array of image and thumbnail URIs */
    images: PropTypes.arrayOf(
        PropTypes.shape({
            thumbnail: PropTypes.string,
            image: PropTypes.string,
        }),
    ).isRequired,

    /** optional: max number of images to show in the row if different than images length */
    // eslint-disable-next-line react/require-default-props
    size: PropTypes.number,

    /** optional: total number of images if different than images length */
    // eslint-disable-next-line react/require-default-props
    total: PropTypes.number,

    hoverStyle: stylePropTypes,
};

const defaultProps = {
    hoverStyle: {},
};

function ReportActionItemImages(props) {
    const size = props.size || props.images.length;
    const images = props.images.slice(0, size);
    const remaining = (props.total || props.images.length) - size;

    return (
        <View style={[styles.reportActionItemImages, props.hoverStyle]}>
            {_.map(images, ({thumbnail, image}, index) => {
                const isLastImage = index === props.size - 1;
                return (
                    <View
                        key={image}
                        style={[styles.reportActionItemImage, props.hoverStyle]}
                    >
                        {thumbnail ? (
                            <RenderHTML
                                html={`
                                    <img
                                        src="${thumbnail}"
                                        data-expensify-source="${image}"
                                        data-expensify-fit-container="true"
                                        data-expensify-preview-modal-disabled="true"
                                    />
                            `}
                            />
                        ) : (
                            <Image
                                source={{uri: image}}
                                style={[styles.w100, styles.h100]}
                            />
                        )}
                        {isLastImage && remaining > 0 && (
                            <View style={[styles.reportActionItemImagesMore, props.hoverStyle]}>
                                <Text>+{remaining}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

ReportActionItemImages.propTypes = propTypes;
ReportActionItemImages.defaultProps = defaultProps;
ReportActionItemImages.displayName = 'ReportActionItemImages';

export default ReportActionItemImages;
