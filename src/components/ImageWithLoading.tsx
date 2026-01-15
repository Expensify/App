import delay from 'lodash/delay';
import React, {useEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import AttachmentOfflineIndicator from './AttachmentOfflineIndicator';
import Image from './Image';
import type {ImageObjectPosition, ImageOnLoadEvent, ImageProps} from './Image/types';
import LoadingIndicator from './LoadingIndicator';

type ImageWithSizeLoadingProps = {
    /** Any additional styles to apply */
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether the image requires an authToken */
    isAuthTokenRequired: boolean;

    /** The object position of image */
    objectPosition?: ImageObjectPosition;

    /** Whether to show offline indicator */
    shouldShowOfflineIndicator?: boolean;

    /** Invoked on mount and layout changes */
    onLayout?: (event: LayoutChangeEvent) => void;
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
    ...rest
}: ImageWithSizeLoadingProps) {
    const styles = useThemeStyles();
    const isLoadedRef = useRef<boolean | null>(null);
    const [isImageCached, setIsImageCached] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const {isOffline} = useNetwork();

    const handleError = () => {
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

    const imageLoadedSuccessfully = (e: ImageOnLoadEvent) => {
        isLoadedRef.current = true;
        setIsLoading(false);
        setIsImageCached(true);
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

    return (
        <View
            style={[styles.w100, styles.h100, containerStyles]}
            onLayout={onLayout}
        >
            <Image
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                style={[styles.w100, styles.h100]}
                onLoadStart={() => {
                    if (isLoadedRef.current ?? isLoading) {
                        return;
                    }
                    setIsLoading(true);
                }}
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
            {isLoading && !isImageCached && !isOffline && (
                <LoadingIndicator
                    iconSize={loadingIconSize}
                    style={[styles.opacity1, styles.bgTransparent, loadingIndicatorStyles]}
                />
            )}
            {isLoading && shouldShowOfflineIndicator && !isImageCached && <AttachmentOfflineIndicator isPreview />}
        </View>
    );
}

ImageWithLoading.displayName = 'ImageWithLoading';

export default React.memo(ImageWithLoading);
