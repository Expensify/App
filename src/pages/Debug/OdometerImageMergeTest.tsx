import React, {useRef, useState} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import type {ViewShot} from 'react-native-view-shot';
import captureRef from 'react-native-view-shot';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Test component to verify react-native-view-shot capabilities for odometer image merging.
 * This tests the approach of rendering two images side-by-side and capturing them as a single image.
 *
 * Requirements being tested:
 * 1. Can we capture a View containing two images as a single merged image?
 * 2. Does it work across all platforms (iOS, Android, web, desktop)?
 * 3. Can we control image quality and format?
 * 4. What's the performance like for real-world usage?
 */
function OdometerImageMergeTest() {
    const styles = useThemeStyles();
    const viewShotRef = useRef<View>(null);

    // Test images - using sample URLs, users can input their own
    const [startImageUrl, setStartImageUrl] = useState('https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Start+Odometer');
    const [endImageUrl, setEndImageUrl] = useState('https://via.placeholder.com/600x400/00FF00/FFFFFF?text=End+Odometer+Landscape');
    const [mergedImageUri, setMergedImageUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [captureStats, setCaptureStats] = useState<{duration: number; size?: number} | null>(null);

    const handleMergeImages = async () => {
        if (!viewShotRef.current) {
            setCaptureError('View reference not available');
            return;
        }

        setIsCapturing(true);
        setCaptureError(null);
        setCaptureStats(null);

        try {
            const startTime = Date.now();

            // Capture the view containing both images
            const uri = await captureRef(viewShotRef.current, {
                format: 'jpg',
                quality: 0.9,
                result: 'tmpfile', // Using tmpfile for better cross-platform support
            });

            const duration = Date.now() - startTime;

            setMergedImageUri(uri);
            setCaptureStats({duration});

            // In production, you would upload this uri to the server
            console.log('Merged image URI:', uri);
        } catch (error) {
            setCaptureError(error instanceof Error ? error.message : 'Unknown error during capture');
            console.error('Image merge failed:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleReset = () => {
        setMergedImageUri(null);
        setCaptureError(null);
        setCaptureStats(null);
    };

    return (
        <ScreenWrapper
            testID="OdometerImageMergeTest"
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
        >
            <HeaderWithBackButton title="Odometer Image Merge Test" />

            <ScrollView style={[styles.flex1, styles.ph5]}>
                <Text style={[styles.textLabel, styles.mt4]}>Test Instructions:</Text>
                <Text style={[styles.mt2, styles.mb4]}>
                    This component tests merging two odometer images into one using react-native-view-shot. Enter image URLs or use the defaults, then tap "Merge
                    Images" to test the capture.
                </Text>

                {/* Input fields for custom test images */}
                <TextInput
                    label="Start Odometer Image URL"
                    value={startImageUrl}
                    onChangeText={setStartImageUrl}
                    containerStyles={styles.mb4}
                />

                <TextInput
                    label="End Odometer Image URL"
                    value={endImageUrl}
                    onChangeText={setEndImageUrl}
                    containerStyles={styles.mb4}
                />

                {/* The view that will be captured - this is the "merge" container */}
                <View style={styles.mb4}>
                    <Text style={[styles.textLabel, styles.mb2]}>Images to Merge:</Text>
                    <View
                        ref={viewShotRef}
                        style={localStyles.mergeContainer}
                    >
                        <View style={localStyles.imageSection}>
                            <Text style={localStyles.imageLabel}>Start Reading</Text>
                            <Image
                                source={{uri: startImageUrl}}
                                style={localStyles.image}
                                resizeMode="cover"
                            />
                        </View>

                        <View style={localStyles.divider} />

                        <View style={localStyles.imageSection}>
                            <Text style={localStyles.imageLabel}>End Reading</Text>
                            <Image
                                source={{uri: endImageUrl}}
                                style={localStyles.image}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </View>

                {/* Action buttons */}
                <Button
                    success
                    text={isCapturing ? 'Capturing...' : 'Merge Images'}
                    onPress={handleMergeImages}
                    isDisabled={isCapturing}
                    style={styles.mb4}
                />

                {captureStats && (
                    <View style={[styles.mb4, styles.p3, styles.borderRadiusNormal, {backgroundColor: '#e8f5e9'}]}>
                        <Text style={styles.textLabelSupporting}>Capture completed in {captureStats.duration}ms</Text>
                    </View>
                )}

                {captureError && (
                    <View style={[styles.mb4, styles.p3, styles.borderRadiusNormal, {backgroundColor: '#ffebee'}]}>
                        <Text style={[styles.textLabelSupporting, {color: '#c62828'}]}>Error: {captureError}</Text>
                    </View>
                )}

                {/* Display merged result */}
                {mergedImageUri && (
                    <View style={styles.mb4}>
                        <Text style={[styles.textLabel, styles.mb2]}>Merged Result:</Text>
                        <Image
                            source={{uri: mergedImageUri}}
                            style={localStyles.mergedImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.textLabelSupporting, styles.mt2]}>URI: {mergedImageUri}</Text>

                        <Button
                            text="Reset"
                            onPress={handleReset}
                            style={styles.mt4}
                        />
                    </View>
                )}

                {/* Test notes */}
                <View style={[styles.mt4, styles.mb6, styles.p3, styles.borderRadiusNormal, {backgroundColor: '#f5f5f5'}]}>
                    <Text style={[styles.textLabel, styles.mb2]}>Testing Checklist:</Text>
                    <Text style={styles.textLabelSupporting}>✓ Does capture work on this platform?</Text>
                    <Text style={styles.textLabelSupporting}>✓ Is image quality acceptable?</Text>
                    <Text style={styles.textLabelSupporting}>✓ Is performance adequate (capture time)?</Text>
                    <Text style={styles.textLabelSupporting}>✓ Can the URI be uploaded to backend?</Text>
                    <Text style={styles.textLabelSupporting}>✓ Does it handle different image sizes/ratios?</Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const localStyles = StyleSheet.create({
    mergeContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    imageSection: {
        flex: 1,
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333333',
    },
    image: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: 4,
    },
    divider: {
        width: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
    mergedImage: {
        width: '100%',
        aspectRatio: 2 / 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});

export default OdometerImageMergeTest;
