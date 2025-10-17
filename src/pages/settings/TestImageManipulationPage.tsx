import React, {useState} from 'react';
import {View, Image as RNImage, ActivityIndicator, ScrollView, Platform} from 'react-native';
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

// Platform-specific asset resolution
function getAssetUri(asset: number | {uri: string}): string {
    if (Platform.OS === 'web') {
        // On web, require() returns the actual URI/path
        return typeof asset === 'string' ? asset : (asset as {default?: string}).default ?? String(asset);
    }
    // On native, use resolveAssetSource
    return RNImage.resolveAssetSource(asset).uri;
}

function TestImageManipulationPage() {
    const styles = useThemeStyles();
    const [mergedImageUri, setMergedImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{width: number; height: number} | null>(null);

    // Use bundled receipt images
    const image1 = require('@assets/images/fake-receipt.png');
    const image2 = require('@assets/images/fake-test-drive-employee-receipt.jpg');

    // Web-specific Canvas merge
    const mergeImagesWeb = async (uri1: string, uri2: string): Promise<{uri: string; width: number; height: number}> => {
        return new Promise((resolve, reject) => {
            const img1 = new Image();
            const img2 = new Image();

            img1.crossOrigin = 'anonymous';
            img2.crossOrigin = 'anonymous';

            let loaded = 0;
            const onLoad = () => {
                loaded++;
                if (loaded === 2) {
                    try {
                        // Normalize width to 800px
                        const targetWidth = 800;
                        const scale1 = targetWidth / img1.width;
                        const scale2 = targetWidth / img2.width;

                        const height1 = img1.height * scale1;
                        const height2 = img2.height * scale2;
                        const totalHeight = height1 + height2;

                        const canvas = document.createElement('canvas');
                        canvas.width = targetWidth;
                        canvas.height = totalHeight;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            reject(new Error('Failed to get canvas context'));
                            return;
                        }

                        // Draw first image at top
                        ctx.drawImage(img1, 0, 0, targetWidth, height1);

                        // Draw second image below first
                        ctx.drawImage(img2, 0, height1, targetWidth, height2);

                        // Convert to blob then data URL
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error('Failed to create blob'));
                                return;
                            }
                            const url = URL.createObjectURL(blob);
                            resolve({uri: url, width: targetWidth, height: totalHeight});
                        }, 'image/jpeg', 0.9);
                    } catch (error) {
                        reject(error);
                    }
                }
            };

            img1.onload = onLoad;
            img2.onload = onLoad;
            img1.onerror = () => reject(new Error('Failed to load image 1'));
            img2.onerror = () => reject(new Error('Failed to load image 2'));

            img1.src = uri1;
            img2.src = uri2;
        });
    };

    const mergeImages = async () => {
        setIsLoading(true);
        setError(null);
        setMergedImageUri(null);
        setDimensions(null);

        try {
            // Resolve asset URIs (platform-specific)
            const uri1 = getAssetUri(image1);
            const uri2 = getAssetUri(image2);

            if (Platform.OS === 'web') {
                // Use Canvas API for web
                const result = await mergeImagesWeb(uri1, uri2);
                setMergedImageUri(result.uri);
                setDimensions({width: result.width, height: result.height});
            } else {
                // Use expo-image-manipulator for native
                // Get first image dimensions
                const {width: width1, height: height1} = await new Promise<{width: number; height: number}>((resolve, reject) => {
                    RNImage.getSize(
                        uri1,
                        (width, height) => resolve({width, height}),
                        reject,
                    );
                });

                // Calculate resized height for first image
                const targetWidth = 800;
                const scale1 = targetWidth / width1;
                const resizedHeight1 = height1 * scale1;

                // Merge images vertically
                const result = await manipulateAsync(
                    uri1,
                    [
                        {resize: {width: targetWidth}}, // Normalize width
                        {compose: {uri: uri2, x: 0, y: resizedHeight1}},
                    ],
                    {format: SaveFormat.JPEG, compress: 0.9},
                );

                setMergedImageUri(result.uri);

                // Get merged image dimensions
                RNImage.getSize(
                    result.uri,
                    (width, height) => {
                        setDimensions({width, height});
                    },
                    (err) => {
                        console.error('Failed to get merged image dimensions:', err);
                    },
                );
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to merge images: ${errorMessage}`);
            console.error('Image merge error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper testID={TestImageManipulationPage.displayName}>
            <HeaderWithBackButton title="Test Image Manipulation" />
            <ScrollView contentContainerStyle={[styles.p4, styles.gap4]}>
                <Text style={[styles.textHeadline, styles.mb2]}>Source Images</Text>
                <View style={[styles.flexRow, styles.gap2, styles.mb4]}>
                    <View style={[styles.flex1, styles.alignItemsCenter]}>
                        <RNImage
                            source={image1}
                            style={{width: 150, height: 200}}
                            resizeMode="contain"
                        />
                        <Text style={[styles.textMicro, styles.mt2]}>Image 1</Text>
                    </View>
                    <View style={[styles.flex1, styles.alignItemsCenter]}>
                        <RNImage
                            source={image2}
                            style={{width: 150, height: 200}}
                            resizeMode="contain"
                        />
                        <Text style={[styles.textMicro, styles.mt2]}>Image 2</Text>
                    </View>
                </View>

                <Button
                    success
                    text="Merge Images Vertically"
                    onPress={mergeImages}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                />

                {error && (
                    <View style={[styles.p4, styles.borderRadiusNormal, styles.mt4, {backgroundColor: '#fee'}]}>
                        <Text style={[styles.textLabel, {color: '#c00'}]}>{error}</Text>
                    </View>
                )}

                {isLoading && (
                    <View style={[styles.alignItemsCenter, styles.mt4]}>
                        <ActivityIndicator size="large" />
                        <Text style={[styles.textLabel, styles.mt2]}>Merging images...</Text>
                    </View>
                )}

                {mergedImageUri && (
                    <View style={[styles.mt4]}>
                        <Text style={[styles.textHeadline, styles.mb2]}>Merged Result</Text>
                        {dimensions && (
                            <Text style={[styles.textMicro, styles.mb2]}>
                                Dimensions: {dimensions.width}x{dimensions.height}
                            </Text>
                        )}
                        <View style={[styles.alignItemsCenter, styles.p2, styles.borderRadiusNormal, {backgroundColor: '#f5f5f5'}]}>
                            <RNImage
                                source={{uri: mergedImageUri}}
                                style={{width: 300, height: 400}}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

TestImageManipulationPage.displayName = 'TestImageManipulationPage';

export default TestImageManipulationPage;
