import useImageLoadStall from '@hooks/useImageLoadStall';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import delay from 'lodash/delay';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ImageObjectPosition, ImageOnLoadEvent, ImageProps} from './Image/types';

import AttachmentOfflineIndicator from './AttachmentOfflineIndicator';
import Image from './Image';
import ImageLoadTimeoutNotice from './ImageLoadTimeoutNotice';
import LoadingIndicator from './LoadingIndicator';

type ImageWithSizeLoadingProps = {
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;

    objectPosition?: ImageObjectPosition;
    shouldShowOfflineIndicator?: boolean;

    /** Invoked on mount and layout changes */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Low-resolution URI shown as a placeholder while the full image loads */
    previewUri?: string;

    /** Whether the Retry notice may replace the spinner on stall; small thumbnails suppress it */
    shouldShowTimeoutNotice?: boolean;
} & ImageProps;

function ImageWithLoading({
    onError,
    containerStyles,
    shouldShowOfflineIndicator = true,
    loadingIconSize,
    waitForSession,
    loadingIndicatorStyles,
    resizeMode,
    onLoad,
    onLayout,
    style,
    previewUri,
    shouldShowTimeoutNotice = true,
    ...rest
}: ImageWithSizeLoadingProps) {
    const styles = useThemeStyles();
    const isLoadedRef = useRef<boolean | null>(null);
    const [isImageCached, setIsImageCached] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoadTimedOut, setHasLoadTimedOut] = useState(false);
    // On web the image keeps the onError it was first given, so handleError reads this ref, not the stale state.
    const hasLoadTimedOutRef = useRef(false);
    const updateLoadTimedOut = (value: boolean) => {
        hasLoadTimedOutRef.current = value;
        setHasLoadTimedOut(value);
    };
    const [reloadKey, setReloadKey] = useState(0);
    const {isOffline} = useNetwork();

    const handleError = () => {
        // A stalled load that later errors is still a slow load, so keep the timeout notice instead of "not found".
        if (hasLoadTimedOutRef.current && shouldShowTimeoutNotice) {
            return;
        }
        onError?.();
        if (isLoadedRef.current) {
            isLoadedRef.current = false;
            setIsImageCached(false);
        }
        if (isOffline) {
            return;
        }
        setIsLoading(false);
    };

    /** The transport went silent. Stop the spinner and offer a retry; the image and preview stay mounted in case the load still finishes. */
    const handleLoadTimeout = () => {
        updateLoadTimedOut(true);
        setIsLoading(false);
    };

    const retryLoad = () => {
        updateLoadTimedOut(false);
        setIsLoading(true);
        setReloadKey((key) => key + 1);
    };

    const imageLoadedSuccessfully = (e: ImageOnLoadEvent) => {
        isLoadedRef.current = true;
        setIsLoading(false);
        setIsImageCached(true);
        updateLoadTimedOut(false);
        onLoad?.(e);
    };

    /** Delay the loader to detect whether the image is being loaded from the cache or the internet. */
    useEffect(() => {
        if (isLoadedRef.current ?? !isLoading) {
            return;
        }
        const timeout = delay(() => {
            if (!isLoading || isLoadedRef.current) {
                return;
            }
            setIsImageCached(false);
        }, 200);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    const shouldShowLoadingIndicator = (previewUri ? isLoading : isLoading && !isImageCached) && !isOffline;

    // !hasLoadTimedOut keeps a cached image unwatched and lets Retry re-arm a fresh window
    const reportLoadActivity = useImageLoadStall(isLoading && !isOffline && !hasLoadTimedOut, handleLoadTimeout);

    return (
        <View
            style={[styles.w100, styles.h100, containerStyles]}
            onLayout={onLayout}
        >
            {(isLoading || hasLoadTimedOut) &&
                !!previewUri && (
                    // Preview is a placeholder; parent onLoad should fire only when the full image is ready.
                    // eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop.
                    <Image
                        {...rest}
                        source={{uri: previewUri}}
                        style={[styles.pAbsolute, styles.w100, styles.h100, styles.opacitySemiTransparent, style]}
                        resizeMode={resizeMode}
                        loadingIconSize={loadingIconSize}
                        loadingIndicatorStyles={loadingIndicatorStyles}
                    />
                )}
            {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
            <Image
                {...rest}
                key={reloadKey}
                style={[styles.w100, styles.h100, style]}
                resizeMode={resizeMode}
                onLoadStart={() => {
                    if (isLoadedRef.current ?? isLoading) {
                        return;
                    }
                    setIsLoading(true);
                }}
                onProgress={reportLoadActivity}
                onError={handleError}
                onLoad={(e) => {
                    imageLoadedSuccessfully(e);
                }}
                waitForSession={() => {
                    // Called when the image should wait for a valid session to reload
                    // At the moment this function is called, the image is not in cache anymore
                    isLoadedRef.current = false;
                    setIsImageCached(false);
                    setIsLoading(true);
                    waitForSession?.();
                }}
                loadingIconSize={loadingIconSize}
                loadingIndicatorStyles={loadingIndicatorStyles}
            />
            {shouldShowLoadingIndicator && (
                <LoadingIndicator
                    iconSize={loadingIconSize}
                    style={[styles.opacity1, styles.bgTransparent, loadingIndicatorStyles]}
                    extraLoadingContext={{
                        context: 'ImageWithLoading',
                        hasPreview: !!previewUri,
                    }}
                />
            )}
            {hasLoadTimedOut && !isOffline && shouldShowTimeoutNotice && <ImageLoadTimeoutNotice onRetry={retryLoad} />}
            {isLoading && shouldShowOfflineIndicator && !isImageCached && <AttachmentOfflineIndicator isPreview />}
        </View>
    );
}

ImageWithLoading.displayName = 'ImageWithLoading';

export default ImageWithLoading;
export type {ImageWithSizeLoadingProps};
