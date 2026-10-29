import LoadingIndicator from '@components/LoadingIndicator';
import {useSession} from '@components/OnyxListItemProvider';

import useNetwork from '@hooks/useNetwork';

import reauthenticateAttachmentImages from '@libs/actions/Session/AttachmentImageReauthenticator';
import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';

import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';

import type {ImageOnLoadEvent, ImageProps} from './types';

import BaseImage from './BaseImage';
import getImageSource from './getImageSource';
import {ImageBehaviorContext} from './ImageBehaviorContextProvider';

type ImageState = {
    requestID: number;
    sourceKey: ImageProps['source'] | string;
    source: ImageProps['source'];
    accountID: Session['accountID'];
    isAuthTokenRequired: boolean;
    isOffline: boolean;
    hasAuthToken: boolean;
};

type FailedImage = {
    sourceKey: ImageState['sourceKey'];
    accountID: number | undefined;
    encryptedAuthToken: string;
    shouldRetry: boolean;
    retryToken?: string;
};

function Image({
    source: propsSource,
    shouldCalculateAspectRatioForWideImage = false,
    isAuthTokenRequired = false,
    onLoad,
    onError,
    objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL,
    style,
    loadingIconSize,
    loadingIndicatorStyles,
    imageWidthToCalculateHeight,
    ...forwardedProps
}: ImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const isObjectPositionTop = objectPosition === CONST.IMAGE_OBJECT_POSITION.TOP;
    const session = useSession();
    const {isOffline} = useNetwork();
    const [failedImage, setFailedImage] = useState<FailedImage>();
    const activeRequest = useRef<number>(undefined);
    const recoveryController = useRef<AbortController>(undefined);
    const imageErrorCallback = useRef<(failedRequestID: number) => void>(undefined);
    const sourceKey =
        typeof propsSource === 'object' && propsSource !== null && 'uri' in propsSource && typeof propsSource.uri === 'string' && Object.keys(propsSource).every((key) => key === 'uri')
            ? propsSource.uri
            : propsSource;
    // Build sources inside state callbacks so each request receives fresh loader input.
    const createImageState = (nextRequestID: number): ImageState => ({
        requestID: nextRequestID,
        sourceKey,
        source: getImageSource({propsSource, encryptedAuthToken: session?.encryptedAuthToken, isAuthTokenRequired}),
        accountID: session?.accountID,
        isAuthTokenRequired,
        isOffline,
        hasAuthToken: !!session?.encryptedAuthToken,
    });
    const [imageState, setImageState] = useState(() => createImageState(0));
    const isCurrentFailedImage = !!failedImage && failedImage.sourceKey === sourceKey && failedImage.accountID === session?.accountID;

    // Freeze successful image credentials so routine API token updates do not reload every image.
    if (
        imageState.sourceKey !== sourceKey ||
        imageState.accountID !== session?.accountID ||
        imageState.isAuthTokenRequired !== isAuthTokenRequired ||
        imageState.isOffline !== isOffline ||
        imageState.hasAuthToken !== !!session?.encryptedAuthToken
    ) {
        setFailedImage(undefined);
        setImageState((current) => createImageState(current.requestID + 1));
    } else if (isCurrentFailedImage && failedImage.shouldRetry && !failedImage.retryToken && session?.encryptedAuthToken && session.encryptedAuthToken !== failedImage.encryptedAuthToken) {
        setFailedImage({...failedImage, retryToken: session.encryptedAuthToken});
        setImageState((current) => createImageState(current.requestID + 1));
    }

    const {shouldSetAspectRatioInStyle} = useContext(ImageBehaviorContext);

    const getAspectRatioStyle = () => {
        if (!shouldSetAspectRatioInStyle || !aspectRatio) {
            return {};
        }

        if (!!imageWidthToCalculateHeight && typeof aspectRatio === 'number') {
            return {
                width: '100%',
                height: imageWidthToCalculateHeight / aspectRatio,
            };
        }

        return {aspectRatio, height: 'auto'};
    };
    const aspectRatioStyle = getAspectRatioStyle();

    const updateAspectRatio = (width: number, height: number) => {
        if (!isObjectPositionTop) {
            return;
        }

        if (width > height && !shouldCalculateAspectRatioForWideImage) {
            setAspectRatio(1);
            return;
        }

        setAspectRatio(height ? width / height : 'auto');
    };

    const handleLoad = (event: ImageOnLoadEvent) => {
        const {width, height} = event.nativeEvent;

        onLoad?.(event);
        updateAspectRatio(width, height);
    };

    const isAuthenticatedURL =
        isAuthTokenRequired &&
        typeof propsSource === 'object' &&
        propsSource !== null &&
        'uri' in propsSource &&
        typeof propsSource.uri === 'string' &&
        canSendAuthTokenToURL(propsSource.uri);
    const {source, requestID} = imageState;

    useLayoutEffect(() => {
        activeRequest.current = requestID;
        const controller = new AbortController();
        recoveryController.current = controller;
        return () => {
            activeRequest.current = undefined;
            controller.abort();
        };
    }, [requestID]);

    const recoverImage = (failedRequestID: number) => {
        if (activeRequest.current !== failedRequestID) {
            return;
        }
        const token = source && typeof source === 'object' && 'headers' in source ? source.headers?.[CONST.CHAT_ATTACHMENT_TOKEN_KEY] : undefined;
        if (isOffline || !isAuthenticatedURL || !token) {
            onError?.();
            return;
        }
        if (isCurrentFailedImage) {
            if (token !== failedImage.encryptedAuthToken) {
                setFailedImage({...failedImage, shouldRetry: false});
                onError?.();
            }
            return;
        }

        const imageFailure: FailedImage = {sourceKey, accountID: session?.accountID, encryptedAuthToken: token, shouldRetry: true};
        setFailedImage(imageFailure);
        forwardedProps.waitForSession?.();

        // An API response may have already replaced the token used by this image.
        if (session?.encryptedAuthToken && token !== session.encryptedAuthToken) {
            return;
        }

        reauthenticateAttachmentImages(propsSource.uri ?? '', token, recoveryController.current?.signal)
            .then(({wasSuccessful}) => {
                if (wasSuccessful || activeRequest.current !== requestID) {
                    return;
                }
                // A false result may start SAML; a still-mounted image must also leave its loading state.
                setFailedImage((current) => (current === imageFailure ? {...current, shouldRetry: false} : current));
                onError?.();
            })
            .catch((error: unknown) => {
                if (activeRequest.current !== requestID) {
                    return;
                }
                setFailedImage((current) => (current === imageFailure ? {...current, shouldRetry: false} : current));
                Log.hmmm('Could not recover attachment image or receipt', {error});
                onError?.();
            });
    };
    // Expo's web loader retains its error callback while the source is unchanged.
    useLayoutEffect(() => {
        imageErrorCallback.current = recoverImage;
    });

    useEffect(() => {
        if (!isAuthTokenRequired || source !== undefined) {
            return;
        }
        forwardedProps?.waitForSession?.();
    }, [source, isAuthTokenRequired, forwardedProps]);

    /**
     * If the image fails to load and the object position is top, we should hide the image by setting the opacity to 0.
     */
    const shouldOpacityBeZero = isObjectPositionTop && !aspectRatio;

    if (source === undefined && !!forwardedProps?.waitForSession) {
        return undefined;
    }
    if (source === undefined) {
        return (
            <LoadingIndicator
                iconSize={loadingIconSize}
                style={loadingIndicatorStyles}
            />
        );
    }

    return (
        <BaseImage
            {...forwardedProps}
            onError={() => imageErrorCallback.current?.(requestID)}
            onLoad={handleLoad}
            style={[style, aspectRatioStyle, shouldOpacityBeZero && {opacity: 0}]}
            source={source}
        />
    );
}

Image.displayName = 'Image';

export default Image;
