import React from 'react';
import {Image, View} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useTheme from '@styles/themes/useTheme';
import useStyleUtils from '@styles/useStyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png'];
const MAX_IMAGE_HEIGHT = 180;
const MAX_IMAGE_WIDTH = 340;

type ImageData = {
    /** The height of the image. */
    height: number;

    /** The width of the image. */
    width: number;

    /** The URL of the image. */
    url: string;

    /** The type of the image. */
    type?: string;
};

type LinkMetadata = {
    /** The URL of the link. */
    url?: string;

    /** A description of the link. */
    description?: string;

    /** The title of the link. */
    title?: string;

    /** The publisher of the link. */
    publisher?: string;

    /** The image associated with the link. */
    image?: ImageData;

    /** The provider logo associated with the link. */
    logo?: ImageData;
};

type LinkPreviewerProps = {
    /** Data about links provided in message. */
    linkMetadata?: LinkMetadata[];

    /** Maximum amount of visible link previews. -1 means unlimited amount of previews */
    maxAmountOfPreviews?: number;
};

function LinkPreviewer({linkMetadata = [], maxAmountOfPreviews = -1}: LinkPreviewerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const uniqueLinks = linkMetadata.filter((link, index, self) => self.findIndex((t) => t.url === link.url) === index);
    const linksToShow = uniqueLinks.slice(0, maxAmountOfPreviews >= 0 ? Math.min(maxAmountOfPreviews, linkMetadata.length) : linkMetadata.length);
    return linksToShow.map((linkData) => {
        const {description, image, title, logo, publisher, url} = linkData;
        return (
            linkData && (
                <View
                    style={styles.linkPreviewWrapper}
                    key={url}
                >
                    <View style={styles.flexRow}>
                        {logo && (
                            <Image
                                style={styles.linkPreviewLogoImage}
                                source={{uri: logo.url}}
                            />
                        )}
                        {publisher && (
                            <Text
                                fontSize={variables.fontSizeLabel}
                                style={styles.pl2}
                            >
                                {publisher}
                            </Text>
                        )}
                    </View>
                    {title && url && (
                        <TextLink
                            fontSize={variables.fontSizeNormal}
                            style={[styles.mv2, StyleUtils.getTextColorStyle(theme.link), styles.alignSelfStart]}
                            href={url}
                        >
                            {title}
                        </TextLink>
                    )}
                    {description && <Text fontSize={variables.fontSizeNormal}>{description}</Text>}
                    {image?.type && IMAGE_TYPES.includes(image.type) && (
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
    });
}

LinkPreviewer.displayName = 'ReportLinkPreview';

export default LinkPreviewer;
