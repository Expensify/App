import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSession} from '@components/OnyxProvider';
import {isExpiredSession} from '@libs/actions/Session';
import {activate as activateReauthenticator} from '@libs/actions/Session/Reauthenticator';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseImage from './BaseImage';
import {ImageBehaviorContext} from './ImageBehaviorContextProvider';
import type {ImageOnLoadEvent, ImageProps} from './types';

function Image({source: propsSource, isAuthTokenRequired = false, onLoad, objectPosition = CONST.IMAGE_OBJECT_POSITION.INITIAL, style, ...forwardedProps}: ImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const isObjectPositionTop = objectPosition === CONST.IMAGE_OBJECT_POSITION.TOP;
    const session = useSession();
    if (session.creationDate) console.log(`@51888 initialize with session ${new Date(session.creationDate).toISOString()} `);
                
    const {shouldSetAspectRatioInStyle} = useContext(ImageBehaviorContext);

    const updateAspectRatio = useCallback(
        (width: number, height: number) => {
            console.log(`@51888 updateAspectRatio`);
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
            console.log(`@51888 onload image width ${width} height ${height}`);
            onLoad?.(event);
            updateAspectRatio(width, height);
        },
        [onLoad, updateAspectRatio],
    );

    // an accpeted session is either received less than 60s after the previous
    // or is dated from 2H after and is now quite
    const isAcceptedSession = useCallback(
        (sessionCreationDateDiff : number, sessionCreationDate : number)  => {
            return (sessionCreationDateDiff < 60000 
                || (sessionCreationDateDiff >= CONST.SESSIONS_MAXIDLE_TIME_MS 
                    &&  new Date().getTime() - sessionCreationDate < 60000));
        },[] 
    );

    /**
     * trying to figure out if the current session is expired or fresh from a necessary reauthentication
     */
    const previousSessionAge = useRef<number | undefined>();
    const validSessionAge: number | undefined = useMemo(() => {
        // for performance gain, the processing is reserved to attachments images only
        if (!isAuthTokenRequired){
            return undefined;
        }
        if (session?.creationDate) {
            console.log(`@51888 setting validSessionAge with session ${new Date(session.creationDate).toISOString()} `);
            if (previousSessionAge.current) {
                console.log(`@51888 setting validSessionAge with previousSessionAge.current ${new Date(previousSessionAge.current).toISOString()} `);
                // most likely a reauthentication happens
                // but unless the calculated source is different from the previous, the image wont reload
                if (isAcceptedSession(session.creationDate - previousSessionAge.current, session.creationDate)) {
                    console.log(`@51888 setting validSessionAge to new session received less than 60s ago or newer from 2H`);
                    return session.creationDate;
                }
                console.log(`@51888 setting validSessionAge to unchanged`);
                return previousSessionAge.current;
            }
            else {
                console.log(`@51888 setting validSessionAge with previousSessionAge.current ${previousSessionAge?.current}`);
            }
            if (isExpiredSession(session.creationDate)) {
                console.log(`@51888 setting validSessionAge to now as session is expired`);
                return new Date().getTime();
            }
            console.log(`@51888 setting validSessionAge to current session ${new Date(session.creationDate).toISOString()}`);
            return session.creationDate;
        }
        console.log(`@51888 setting validSessionAge with session ${session?.creationDate} `);
        return undefined;
    }, [session]);
    useEffect(() => {
        // for performance gain, the processing is reserved to attachments images only
        if (isAuthTokenRequired){
            previousSessionAge.current = validSessionAge;
            console.log(`@51888 useEffect setting previousSessionAge to ${validSessionAge?new Date(validSessionAge).toISOString():validSessionAge}`);
        }
    });

    /**
     * Check if the image source is a URL - if so the `encryptedAuthToken` is appended
     * to the source.
     */
    // source could be a result of require or a number or an object but all are expected so no unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const source = useMemo(() => {
        console.log(`@51888 calculating source`);
        if (typeof propsSource === 'object' && 'uri' in propsSource) {
            if (typeof propsSource.uri === 'number') {
                console.log(`@51888 source as number `, propsSource.uri);
                return propsSource.uri;
            }
            const authToken = session?.encryptedAuthToken ?? null;
            if (isAuthTokenRequired && authToken) {
                if (!!session?.creationDate && !isExpiredSession(session.creationDate)) {
                    // session valid
                    console.log(`@51888 source with token `, propsSource);
                    return {
                        ...propsSource,
                        headers: {
                            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                        },
                    };
                }
                console.log(`@51888 source as spinner `);
                if (session) activateReauthenticator(session);
                // source could be a result of require, it is expected so no unsafe-assignment
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return require('@assets/images/loadingspinner.gif'); // loading before session changes
            }
        }
        console.log(`@51888 source as default `, propsSource);
        return propsSource;
        // The session prop is not required, as it causes the image to reload whenever the session changes. For more information, please refer to issue #26034.
        // but we still need the image to reload sometimes (exemple : when the current session is expired)
        // by forcing a recalculation of the source (which value could indeed change) through the modification of the variable validSessionAge
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={source}
        />
    );
}

function imagePropsAreEqual(prevProps: ImageProps, nextProps: ImageProps) {
    console.log(`@51888 imagePropsAreEqual? `, {'prev' : prevProps.source, 'next' : nextProps.source});
    return prevProps.source === nextProps.source;
}

const ImageWithOnyx = React.memo(Image, imagePropsAreEqual);

ImageWithOnyx.displayName = 'Image';

export default ImageWithOnyx;
