import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import LogoComponent from '@assets/images/expensify-wordmark.svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Header from './Header';
import ImageSVG from './ImageSVG';
import Text from './Text';

type BreadcrumbHeader = {
    type: typeof CONST.BREADCRUMB_TYPE.ROOT;
};

type BreadcrumbStrong = {
    text: string;
    type: typeof CONST.BREADCRUMB_TYPE.STRONG;
};

type Breadcrumb = {
    text: string;
    type?: typeof CONST.BREADCRUMB_TYPE.NORMAL;
};

type BreadcrumbsProps = {
    /** An array of breadcrumbs consisting of the root/strong breadcrumb, followed by an optional second level breadcrumb  */
    breadcrumbs: [BreadcrumbHeader | BreadcrumbStrong, Breadcrumb | undefined];

    /** Styles to apply to the container */
    style?: StyleProp<ViewStyle>;
};

function Breadcrumbs({breadcrumbs, style}: BreadcrumbsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [primaryBreadcrumb, secondaryBreadcrumb] = breadcrumbs;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.w100, style]}>
            {primaryBreadcrumb.type === CONST.BREADCRUMB_TYPE.ROOT ? (
                <View style={styles.breadcrumbLogo}>
                    <Header
                        title={
                            <ImageSVG
                                contentFit="contain"
                                src={LogoComponent}
                                fill={theme.text}
                                width={variables.lhnLogoWidth}
                                height={variables.lhnLogoHeight}
                            />
                        }
                        shouldShowEnvironmentBadge
                    />
                </View>
            ) : (
                <Text
                    numberOfLines={1}
                    style={[styles.flexShrink1, styles.breadcrumb, styles.breadcrumbStrong]}
                >
                    {primaryBreadcrumb.text}
                </Text>
            )}

            {!!secondaryBreadcrumb && (
                <>
                    <Text style={[styles.breadcrumbSeparator]}>/</Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.mw75, styles.flexShrink0, styles.breadcrumb]}
                    >
                        {secondaryBreadcrumb.text}
                    </Text>
                </>
            )}
        </View>
    );
}

Breadcrumbs.displayName = 'Breadcrumbs';

export type {BreadcrumbsProps};
export default Breadcrumbs;
