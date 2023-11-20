import {uniqBy} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Image, View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png'];
const MAX_IMAGE_HEIGHT = 180;
const MAX_IMAGE_WIDTH = 340;

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

    /** Maximum amount of visible link previews. -1 means unlimited amount of previews */
    maxAmountOfPreviews: PropTypes.number,
};

const defaultProps = {
    linkMetadata: [],
    maxAmountOfPreviews: -1,
};

function LinkPreviewer(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return _.map(
        _.take(uniqBy(props.linkMetadata, 'url'), props.maxAmountOfPreviews >= 0 ? Math.min(props.maxAmountOfPreviews, props.linkMetadata.length) : props.linkMetadata.length),
        (linkData) => {
            if (_.isArray(linkData)) {
                return;
            }
            const {description, image, title, logo, publisher, url} = linkData;

            return (
                linkData && (
                    <View
                        style={styles.linkPreviewWrapper}
                        key={url}
                    >
                        <View style={styles.flexRow}>
                            {!_.isEmpty(logo) && (
                                <Image
                                    style={styles.linkPreviewLogoImage}
                                    source={{uri: logo.url}}
                                />
                            )}
                            {!_.isEmpty(publisher) && (
                                <Text
                                    fontSize={variables.fontSizeLabel}
                                    style={styles.pl2}
                                >
                                    {publisher}
                                </Text>
                            )}
                        </View>
                        {!_.isEmpty(title) && (
                            <TextLink
                                fontSize={variables.fontSizeNormal}
                                style={[styles.mv2, StyleUtils.getTextColorStyle(theme.link), styles.alignSelfStart]}
                                href={url}
                            >
                                {title}
                            </TextLink>
                        )}
                        {!_.isEmpty(description) && <Text fontSize={variables.fontSizeNormal}>{description}</Text>}
                        {!_.isEmpty(image) && IMAGE_TYPES.includes(image.type) && (
                            <Image
                                style={[
                                    styles.linkPreviewImage,
                                    {
                                        aspectRatio: image.width / image.height,
                                        maxHeight: Math.min(image.height, MAX_IMAGE_HEIGHT),

                                        // Calculate maximum width when image is too tall, so it doesn't move away from left
                                        maxWidth: Math.min((Math.min(image.height, MAX_IMAGE_HEIGHT) / image.height) * image.width, MAX_IMAGE_WIDTH),
                                    },
                                ]}
                                resizeMode="contain"
                                source={{uri: image.url}}
                            />
                        )}
                    </View>
                )
            );
        },
    );
}

LinkPreviewer.propTypes = propTypes;
LinkPreviewer.defaultProps = defaultProps;
LinkPreviewer.displayName = 'ReportLinkPreview';

export default LinkPreviewer;
