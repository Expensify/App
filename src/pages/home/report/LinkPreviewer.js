import React from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {uniqBy} from 'lodash';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import colors from '../../../styles/colors';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png'];

const propTypes = {
    /** Data about links provided in message. */
    linkMetadata: PropTypes.arrayOf(
        PropTypes.shape({
            /**  The URL of the link. */
            url: PropTypes.string,

            /**  A description of the link. */
            description: PropTypes.string,

            /**  The title of the link. */
            title: PropTypes.string,

            /**  The publisher of the link. */
            publisher: PropTypes.string,

            /**  The image associated with the link. */
            image: PropTypes.shape({
                /**  The height of the image. */
                height: PropTypes.number,

                /**  The width of the image. */
                width: PropTypes.number,

                /**  The URL of the image. */
                url: PropTypes.string,
            }),

            /**  The provider logo associated with the link. */
            logo: PropTypes.shape({
                /**  The height of the logo. */
                height: PropTypes.number,

                /**  The width of the logo. */
                width: PropTypes.number,

                /**  The URL of the logo. */
                url: PropTypes.string,
            }),
        }),
    ),

    /** Maximum amount of visible link previews. */
    maxAmountOfPreviews: PropTypes.number,
};

const defaultProps = {
    linkMetadata: [],
    maxAmountOfPreviews: undefined
};

const LinkPreviewer = props => (
    _.map(_.take(uniqBy(props.linkMetadata, 'url'), props.maxAmountOfPreviews > 0 ? Math.min(props.maxAmountOfPreviews, props.linkMetadata.length) : props.linkMetadata.length), (linkData) => {
        const {
            description, image, title, logo, publisher, url,
        } = linkData;

        return linkData && (
            <View style={styles.linkPreviewWrapper} key={url}>
                <View style={styles.flexRow}>
                    {logo && <Image style={styles.linkPreviewLogoImage} source={{uri: logo.url}} />}
                    {publisher && <Text fontSize={variables.fontSizeLabel} style={styles.pl2}>{publisher}</Text>}
                </View>
                {title && <Text fontSize={variables.fontSizeNormal} style={styles.pv2} color={colors.blueLinkPreview}>{title}</Text>}
                {description && <Text fontSize={variables.fontSizeNormal}>{description}</Text>}
                <View style={styles.flexRow}>
                    {image && IMAGE_TYPES.includes(image.type) && (
                        <Image
                            style={[styles.linkPreviewImage, {
                                aspectRatio: image.width / image.height,
                            }]}
                            resizeMode="contain"
                            source={{uri: image.url}}
                        />
                    )}
                </View>
            </View>
        );
    })
);

LinkPreviewer.propTypes = propTypes;
LinkPreviewer.defaultProps = defaultProps;
LinkPreviewer.displayName = 'ReportLinkPreview';

export default LinkPreviewer;
