import React from 'react';
import {Image, View} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {LinkMetadata} from '@src/types/onyx/ReportAction';

const IMAGE_TYPES = new Set(['jpg', 'jpeg', 'png']);
const MAX_IMAGE_HEIGHT = 180;
const MAX_IMAGE_WIDTH = 340;

type LinkPreviewerProps = {
    /** Data about links provided in message. */
    linkMetadata?: LinkMetadata[];

    /** Maximum amount of visible link previews. -1 means unlimited amount of previews */
    maxAmountOfPreviews?: number;
};

function filterNonUniqueLinks(linkMetadata: LinkMetadata[]): LinkMetadata[] {
    const linksMap = new Map<string, string>();
    const result: LinkMetadata[] = [];

    for (const item of linkMetadata) {
        if (!item.url || linksMap.has(item.url)) {
            continue;
        }

        linksMap.set(item.url, item.url);
        result.push(item);
    }

    return result;
}

function LinkPreviewer({linkMetadata = [], maxAmountOfPreviews = -1}: LinkPreviewerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const uniqueLinks = filterNonUniqueLinks(linkMetadata);
    const maxAmountOfLinks = maxAmountOfPreviews >= 0 ? Math.min(maxAmountOfPreviews, linkMetadata.length) : linkMetadata.length;
    const linksToShow = uniqueLinks.slice(0, maxAmountOfLinks);
    return linksToShow.map((linkData) => {
        if (!linkData && Array.isArray(linkData)) {
            return;
        }
        const {description, image, title, logo, publisher, url} = linkData;
        return (
            <View
                style={styles.linkPreviewWrapper}
                key={url}
            >
                <View style={styles.flexRow}>
                    {!!logo && (
                        <Image
                            style={styles.linkPreviewLogoImage}
                            source={{uri: logo.url}}
                        />
                    )}
                    {!!publisher && (
                        <Text
                            fontSize={variables.fontSizeLabel}
                            style={styles.pl2}
                        >
                            {publisher}
                        </Text>
                    )}
                </View>
                {!!title && !!url && (
                    <TextLink
                        fontSize={variables.fontSizeNormal}
                        style={[styles.mv2, StyleUtils.getTextColorStyle(theme.link), styles.alignSelfStart]}
                        href={url}
                    >
                        {title}
                    </TextLink>
                )}
                {!!description && <Text fontSize={variables.fontSizeNormal}>{description}</Text>}
                {!!image?.type && IMAGE_TYPES.has(image.type) && !!image.width && !!image.height && (
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
        );
    });
}

LinkPreviewer.displayName = 'ReportLinkPreview';

export default LinkPreviewer;
