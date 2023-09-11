import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import * as AttachmentCarouselViewPropTypes from '../propTypes';
import styles from '../../../styles/styles';

const propTypes = {
    currentIndex: PropTypes.number.isRequired,

    attachments: AttachmentCarouselViewPropTypes.attachmentsPropType.isRequired,

    renderItem: PropTypes.func.isRequired,

    windowSize: PropTypes.number,
};

const defaultProps = {
    windowSize: 5,
};

function Carousel({attachments, renderItem, currentIndex, windowSize}) {
    const usableAttachments = attachments.slice(Math.max(currentIndex - 1 - Math.floor(windowSize / 2), 0), Math.min(currentIndex + Math.ceil(windowSize / 2), attachments.length));

    const Element = _.map(usableAttachments, (item) => (
        <View
            key={item.source}
            style={[
                {
                    opacity: attachments[currentIndex].source === item.source ? 1 : 0,
                    zIndex: attachments[currentIndex].source === item.source ? 1 : -1,
                },
                styles.webCarousel,
            ]}
        >
            {renderItem({item})}
        </View>
    ));

    return <View style={styles.flex1}>{Element}</View>;
}

Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;

export default Carousel;
