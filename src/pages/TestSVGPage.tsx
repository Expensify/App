import React, {useCallback, useState} from 'react';
import type {ListRenderItem} from 'react-native';
import {FlatList, StyleSheet, View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import {svgItems as svgItemsCompressed} from '@src/svgAssets';
import type {SVGItem} from '@src/svgAssets1';
import {svgItems} from '@src/svgAssetsOriginal';
import type IconAsset from '@src/types/utils/IconAsset';

const backgroundColors = [colors.productDark400, colors.productLight100];
const svgFillColors = [undefined, colors.green400];

type SVGComparisonItem = SVGItem & {
    compressedComponent: IconAsset;
};

const createSVGcomparisonArray = (originalSVGItems: SVGItem[], compressedSVGItems: SVGItem[]) => {
    return originalSVGItems.map((item) => ({
        ...item,
        compressedComponent: compressedSVGItems.find((compressedItem) => compressedItem.position === item.position)?.component as IconAsset,
    }));
};

const localStyles = StyleSheet.create({
    itemContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    innerContainer: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
        flex: 1,
    },
    imageContainer: {
        borderWidth: 1,
        borderColor: 'black',
        minHeight: 120,
        width: '47%',
    },
});

function TestSVGPage() {
    const styles = useThemeStyles();
    const [backgroundColor, setBackgroundColor] = useState<string>(colors.productDark400);
    const [svgFillColor, setSvgFillColor] = useState<string | undefined>(undefined);
    const comparisonArray = createSVGcomparisonArray(svgItems, svgItemsCompressed);

    const renderSVGComparisonItem: ListRenderItem<SVGComparisonItem> = useCallback(
        ({item}) => (
            <View style={[localStyles.itemContainer]}>
                <View style={localStyles.innerContainer}>
                    <View style={localStyles.imageContainer}>
                        <ImageSVG
                            src={item.component as IconAsset}
                            style={styles.mb2}
                            fill={svgFillColor}
                            contentFit="contain"
                        />
                        <Text
                            style={[styles.textLabelSupporting, styles.textAlignCenter]}
                            numberOfLines={2}
                        >
                            original
                        </Text>
                    </View>

                    <View style={localStyles.imageContainer}>
                        <ImageSVG
                            src={item.compressedComponent}
                            style={styles.mb2}
                            fill={svgFillColor}
                            contentFit="contain"
                        />
                        <Text
                            style={[styles.textLabelSupporting, styles.textAlignCenter]}
                            numberOfLines={2}
                        >
                            compressed
                        </Text>
                    </View>
                </View>
                <Text
                    style={[styles.textLabelSupporting, styles.textAlignCenter, {marginTop: 15}]}
                    numberOfLines={2}
                >
                    {item.position}. {item.name}
                </Text>
            </View>
        ),
        [styles.mb2, styles.textLabelSupporting, styles.textAlignCenter, svgFillColor],
    );

    return (
        <ScreenWrapper
            testID={TestSVGPage.displayName}
            shouldShowOfflineIndicator={false}
        >
            <View style={[styles.flex1, styles.ph2, styles.pv4, {backgroundColor}]}>
                <Text style={[styles.textHeadlineH1, styles.mb4, styles.textAlignCenter]}>SVG Assets Gallery {svgItems.length} total</Text>
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.mb4]}>
                    <Button
                        text="Change Background Color"
                        onPress={() => {
                            const colorIndex = backgroundColors.indexOf(backgroundColor);
                            const nextColorIndex = colorIndex === backgroundColors.length - 1 ? 0 : colorIndex + 1;
                            setBackgroundColor(backgroundColors.at(nextColorIndex) ?? colors.productDark400);
                        }}
                    />
                    <Button
                        text={svgFillColor ? 'Remove SVG Fill Color' : 'Add SVG Fill Color'}
                        onPress={() => {
                            const colorIndex = svgFillColors.indexOf(svgFillColor);
                            const nextColorIndex = colorIndex === svgFillColors.length - 1 ? 0 : colorIndex + 1;
                            setSvgFillColor(svgFillColors.at(nextColorIndex));
                        }}
                    />
                </View>

                <FlatList
                    // force rerender when svgFillColor changes
                    key={svgFillColor?.toString() ?? 'default'}
                    data={comparisonArray}
                    renderItem={renderSVGComparisonItem}
                    keyExtractor={(item) => item.position.toString()}
                    showsVerticalScrollIndicator
                    contentContainerStyle={styles.pb4}
                />
            </View>
        </ScreenWrapper>
    );
}

// WithTheme is a HOC that provides theme-related contexts (e.g. to the SignInPageWrapper component since these contexts are required for variable declarations).
function WithTheme(Component: React.ComponentType) {
    return () => (
        <ThemeProvider theme={CONST.THEME.DARK}>
            <ThemeStylesProvider>
                <Component />
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

const TestSVGPageThemed = WithTheme(TestSVGPage);

export {TestSVGPageThemed as TestSVGPage};

export default WithTheme(TestSVGPage);

TestSVGPage.displayName = 'TestSVGPage';
