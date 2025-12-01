import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {PixelRatio, View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const isRootBreadcrumb = primaryBreadcrumb.type === CONST.BREADCRUMB_TYPE.ROOT;
    const fontScale = PixelRatio.getFontScale() > CONST.LOGO_MAX_SCALE ? CONST.LOGO_MAX_SCALE : PixelRatio.getFontScale();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark'] as const);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.w100, styles.breadcrumbsContainer, style]}>
            {isRootBreadcrumb ? (
                <View style={styles.breadcrumbLogo}>
                    <Header
                        title={
                            <ImageSVG
                                contentFit="contain"
                                src={icons.ExpensifyWordmark}
                                fill={theme.text}
                                width={variables.lhnLogoWidth * fontScale}
                                height={variables.lhnLogoHeight * fontScale}
                            />
                        }
                        style={styles.justifyContentCenter}
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
                        style={[styles.mw75, styles.breadcrumb, isRootBreadcrumb ? styles.flex1 : styles.flexShrink0]}
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
