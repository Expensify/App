import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useSession} from '@components/OnyxProvider';
import {isExpiredSession} from '@libs/actions/Session';
import activateReauthenticator from '@libs/actions/Session/Reauthenticator';
import CONST from '@src/CONST';
import BaseImage from './BaseImage';
import {ImageBehaviorContext} from './ImageBehaviorContextProvider';
import type {ImageOnLoadEvent, ImageProps} from './types';

function Image({source: propsSource, isAuthTokenRequired = false, onLoad, objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL, style, ...forwardedProps}: ImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const isObjectPositionTop = objectPosition === CONST.IMAGE_OBJECT_POSITION.TOP;
    const session = useSession();

    if (isAuthTokenRequired && session?.creationDate) {
        console.log(`@51888 image initialized with session  ${session.authToken?.substring(0, 10)} creationDate ${new Date(session.creationDate).toISOString()} `);
    }

    const {shouldSetAspectRatioInStyle} = useContext(ImageBehaviorContext);

    const updateAspectRatio = useCallback(
        (width: number, height: number) => {
            if (!isObjectPositionTop) {
                return;
            }

            if (width > height) {
                setAspectRatio(1);
                return;
            }

            setAspectRatio(height ? width / height : 'auto');
        },
        [isObjectPositionTop],
    );

    const handleLoad = useCallback(
        (event: ImageOnLoadEvent) => {
            const {width, height} = event.nativeEvent;
            onLoad?.(event);
            updateAspectRatio(width, height);
        },
        [onLoad, updateAspectRatio],
    );

    // an accepted session is either received less than 60s after the previous
    // or is the first valid session since previous session expired
    const isAcceptedSession = useCallback((sessionCreationDateDiff: number, sessionCreationDate: number) => {
        return sessionCreationDateDiff < 60000 || (sessionCreationDateDiff >= CONST.SESSION_EXPIRATION_TIME_MS && new Date().getTime() - sessionCreationDate < 60000);
    }, []);

    /**
     * trying to figure out if the current session is expired or fresh from a necessary reauthentication
     */
    const previousSessionAge = useRef<number | undefined>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const validSessionAge: number | undefined = useMemo(() => {
        // for performance gain, the processing is reserved to attachments images only
        if (!isAuthTokenRequired) {
            return undefined;
        }
        if (session?.creationDate) {
            if (previousSessionAge.current) {
                // most likely a reauthentication happens
                // but unless the calculated source is different from the previous, the image wont reload
                if (isAcceptedSession(session.creationDate - previousSessionAge.current, session.creationDate)) {
                    console.log(
                        `@51888 setting validSessionAge to accepted session ${session.authToken?.substring(0, 10)} creationDate ${new Date(
                            session.creationDate,
                        ).toISOString()}} received less than 60s ago or newer from 2H`,
                    );
                    return session.creationDate;
                }
                console.log(`@51888 setting validSessionAge to unchanged`);
                return previousSessionAge.current;
            }
            if (isExpiredSession(session.creationDate)) {
                console.log(`@51888 setting validSessionAge to now as session is expired`);
                return new Date().getTime();
            }
            console.log(`@51888 setting validSessionAge to current session ${session.authToken?.substring(0, 10)} ${new Date(session.creationDate).toISOString()}`);
            return session.creationDate;
        }
        return undefined;
    }, [session, isAuthTokenRequired, isAcceptedSession]);
    useEffect(() => {
        if (!isAuthTokenRequired) {
            return;
        }
        previousSessionAge.current = validSessionAge;
        console.log(`@51888 useEffect setting previousSessionAge to ${validSessionAge ? new Date(validSessionAge).toISOString() : validSessionAge}`);
    });

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    // source could be a result of require or a number or an object but all are expected so no unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const source = useMemo(() => {
        if (typeof propsSource === 'object' && 'uri' in propsSource) {
            if (typeof propsSource.uri === 'number') {
                return propsSource.uri;
            }
            const authToken = session?.encryptedAuthToken ?? null;
            if (isAuthTokenRequired && authToken) {
                if (!!session?.creationDate && !isExpiredSession(session.creationDate)) {
                    console.log(`@51888 setting source with token and session ${session.authToken?.substring(0, 10)} creationDate ${new Date(session.creationDate).toISOString()} `);
                    // session valid
                    return {
                        ...propsSource,
                        headers: {
                            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                        },
                    };
                }
                console.log(`@51888 source as spinner `);
                if (session) {
                    activateReauthenticator(session);
                }
                return undefined;
            }
        }
        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // but we still need the image to reload sometimes (exemple : when the current session is expired)
        // by forcing a recalculation of the source (which value could indeed change) through the modification of the variable validSessionAge
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [propsSource, isAuthTokenRequired, validSessionAge]);
    useEffect(() => {
        if (!isAuthTokenRequired || source !== undefined) {
            return;
        }
        if (forwardedProps?.waitForSession) {
            forwardedProps.waitForSession();
            console.log(`@51888 forwardedProps.waitForSession() `);
        }
        //forwardedProps?.waitForSession?.();
    }, [source, isAuthTokenRequired, forwardedProps]);

    /**
     * If the image fails to load and the object position is top, we should hide the image by setting the opacity to 0.
     */
    const shouldOpacityBeZero = isObjectPositionTop && !aspectRatio;

    if (source === undefined && !!forwardedProps?.waitForSession) {
        return undefined;
    }
    if (source === undefined) {
        return <FullScreenLoadingIndicator flag51888test />;
    }
    return (
        <BaseImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            onLoad={handleLoad}
            style={[style, shouldSetAspectRatioInStyle && aspectRatio ? {aspectRatio, height: 'auto'} : {}, shouldOpacityBeZero && {opacity: 0}]}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={source}
        />
    );
}

function imagePropsAreEqual(prevProps: ImageProps, nextProps: ImageProps) {
    return prevProps.source === nextProps.source;
}

const ImageWithOnyx = React.memo(Image, imagePropsAreEqual);

ImageWithOnyx.displayName = 'Image';

export default ImageWithOnyx;
