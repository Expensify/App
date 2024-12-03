import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseImage from './BaseImage';
import {ImageBehaviorContext} from './ImageBehaviorContextProvider';
import type {ImageOnLoadEvent, ImageOnyxProps, ImageOwnProps, ImageProps} from './types';

function Image({source: propsSource, isAuthTokenRequired = false, session, onLoad, objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL, style, ...forwardedProps}: ImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const isObjectPositionTop = objectPosition === CONST.IMAGE_OBJECT_POSITION.TOP;

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

    /**
     * trying to figure out if the current session is expired or fresh from a necessary reauthentication
     */
    const previousSessionAge = useRef<number | undefined>();
    const validSessionAge: number | undefined = useMemo(
        () =>
            session?.creationDate
                ? !!previousSessionAge.current
                    ? Math.abs(previousSessionAge.current - session.creationDate) < 60000
                        ? session.creationDate
                        : previousSessionAge.current
                    : Math.abs(new Date().getTime() - session.creationDate) >= CONST.SESSIONS_MAXIDLE_NB_HOURS * 3600000
                    ? new Date().getTime()
                    : session.creationDate
                : undefined,
        [session],
    );
    useEffect(() => {
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
                if (!!session?.creationDate && new Date().getTime() - session.creationDate < CONST.SESSIONS_MAXIDLE_NB_HOURS * 3600000) {
                    // session valid
                    return {
                        ...propsSource,
                        headers: {
                            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                        },
                    };
                } else {
                    return require('@assets/images/loadingspinner.gif'); // loading before session changes
                }
            }
        }
        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [propsSource, isAuthTokenRequired, validSessionAge]);

    /**
     * If the image fails to load and the object position is top, we should hide the image by setting the opacity to 0.
     */
    const shouldOpacityBeZero = isObjectPositionTop && !aspectRatio;

    return (
        <BaseImage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...forwardedProps}
            onLoad={handleLoad}
            style={[style, shouldSetAspectRatioInStyle && aspectRatio ? {aspectRatio, height: 'auto'} : {}, shouldOpacityBeZero && {opacity: 0}]}
            source={source}
        />
    );
}

function imagePropsAreEqual(prevProps: ImageOwnProps, nextProps: ImageOwnProps) {
    return prevProps.source === nextProps.source;
}

const ImageWithOnyx = React.memo(
    withOnyx<ImageProps, ImageOnyxProps>({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(Image),
    imagePropsAreEqual,
);

ImageWithOnyx.displayName = 'Image';

export default ImageWithOnyx;
