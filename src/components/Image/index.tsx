import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useSession} from '@components/OnyxListItemProvider';
import {isExpiredSession} from '@libs/actions/Session';
import activateReauthenticator from '@libs/actions/Session/AttachmentImageReauthenticator';
import CONST from '@src/CONST';
import BaseImage from './BaseImage';
import {ImageBehaviorContext} from './ImageBehaviorContextProvider';
import type {ImageOnLoadEvent, ImageProps} from './types';

function Image({
    source: propsSource,
    shouldCalculateAspectRatioForWideImage = false,
    isAuthTokenRequired = false,
    onLoad,
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

    const {shouldSetAspectRatioInStyle} = useContext(ImageBehaviorContext);

    const aspectRatioStyle = useMemo(() => {
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
    }, [shouldSetAspectRatioInStyle, aspectRatio, imageWidthToCalculateHeight]);

    const updateAspectRatio = useCallback(
        (width: number, height: number) => {
            if (!isObjectPositionTop) {
                return;
            }

            if (width > height && !shouldCalculateAspectRatioForWideImage) {
                setAspectRatio(1);
                return;
            }

            setAspectRatio(height ? width / height : 'auto');
        },
        [isObjectPositionTop, shouldCalculateAspectRatioForWideImage],
    );

    const handleLoad = useCallback(
        (event: ImageOnLoadEvent) => {
            const {width, height} = event.nativeEvent;

            onLoad?.(event);
            updateAspectRatio(width, height);
        },
        [onLoad, updateAspectRatio],
    );

    // accepted sessions are sessions of a certain criteria that we think can necessitate a reload of the images
    // because images sources barely changes unless specific events occur like network issues (offline/online) per example.
    // Here we target new session received less than 60s after the previous session (that could be from fresh reauthentication, the previous session was not necessarily expired)
    // or new session after the previous session was expired (based on timestamp gap between the 2 creationDate and the freshness of the new session).
    const isAcceptedSession = useCallback((sessionCreationDateDiff: number, sessionCreationDate: number) => {
        return sessionCreationDateDiff < 60000 || (sessionCreationDateDiff >= CONST.SESSION_EXPIRATION_TIME_MS && new Date().getTime() - sessionCreationDate < 60000);
    }, []);

    /**
     * trying to figure out if the current session is expired or fresh from a necessary reauthentication
     */
    const previousSessionAge = useRef<number | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const validSessionAge: number | undefined = useMemo(() => {
        // Authentication is required only for certain types of images (attachments and receipts),
        // so we only calculate the session age for those
        if (!isAuthTokenRequired) {
            return undefined;
        }
        if (session?.creationDate) {
            if (previousSessionAge.current) {
                // Most likely a reauthentication happened, but unless the calculated source is different from the previous, the image won't reload
                if (isAcceptedSession(session.creationDate - previousSessionAge.current, session.creationDate)) {
                    return session.creationDate;
                }
                return previousSessionAge.current;
            }
            if (isExpiredSession(session.creationDate)) {
                // reset the countdown to now so future sessions creationDate can be compared to that time
                return new Date().getTime();
            }
            return session.creationDate;
        }
        return undefined;
    }, [session?.creationDate, isAuthTokenRequired, isAcceptedSession]);
    useEffect(() => {
        if (!isAuthTokenRequired) {
            return;
        }
        previousSessionAge.current = validSessionAge;
    });

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    const source = useMemo(() => {
        if (typeof propsSource === 'object' && 'uri' in propsSource) {
            if (typeof propsSource.uri === 'number') {
                return propsSource.uri;
            }
            const authToken = session?.encryptedAuthToken ?? null;
            if (isAuthTokenRequired && authToken) {
                if (!!session?.creationDate && !isExpiredSession(session.creationDate)) {
                    return {
                        ...propsSource,
                        headers: {
                            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                        },
                    };
                }
                if (session) {
                    activateReauthenticator(session);
                }
                return undefined;
            }
        }
        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // but we still need the image to reload sometimes (example : when the current session is expired)
        // by forcing a recalculation of the source (which value could indeed change) through the modification of the variable validSessionAge
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [propsSource, isAuthTokenRequired, validSessionAge]);
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
            <FullScreenLoadingIndicator
                iconSize={loadingIconSize}
                style={loadingIndicatorStyles}
            />
        );
    }

    return (
        <BaseImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            onLoad={handleLoad}
            style={[style, aspectRatioStyle, shouldOpacityBeZero && {opacity: 0}]}
            source={source}
        />
    );
}

Image.displayName = 'Image';

export default React.memo(
    Image,
    (prevProps: ImageProps, nextProps: ImageProps) => prevProps.source === nextProps.source && prevProps.imageWidthToCalculateHeight === nextProps.imageWidthToCalculateHeight,
);
