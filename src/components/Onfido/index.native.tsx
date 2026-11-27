import ActivityIndicator from '@components/ActivityIndicator';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import convertEntrustResultToOnfidoPayload from '@libs/convertEntrustResultToOnfidoPayload';
import getPlatform from '@libs/getPlatform';
import goToSettings from '@libs/goToSettings';
import isNativeOnfidoPermissionError, {getNativeOnfidoErrorType} from '@libs/isNativeOnfidoPermissionError';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ThemeColors} from '@entrust.corporation/idvsdk-reactnative/theming/Theme';

import {EntrustIdv} from '@entrust.corporation/idvsdk-reactnative';
import {Document, DocumentType} from '@entrust.corporation/idvsdk-reactnative/steps/Document';
import {FaceVideo} from '@entrust.corporation/idvsdk-reactnative/steps/Face';
import {Welcome} from '@entrust.corporation/idvsdk-reactnative/steps/Welcome';
import {ThemeMode} from '@entrust.corporation/idvsdk-reactnative/theming/Theme';
import React, {useEffect} from 'react';
import {Alert, NativeModules} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';

import type {OnfidoProps} from './types';

const {AppStateTracker} = NativeModules;

function Onfido({sdkToken, onUserExit, onSuccess, onError}: OnfidoProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    useEffect(() => {
        // The iOS SDK crashes the app with a fatal error ("Failed to process SDK Token") when it can't read the token. The bank account
        // page renders this component even when the stored token was cleared, so an empty token is reported as an error instead.
        if (!sdkToken) {
            Log.hmmm('Onfido native flow was opened without an SDK token');
            onError(CONST.ERROR.UNKNOWN_ERROR);
            return;
        }

        // Without a mode the SDK follows the device's light or dark setting, which can differ from the theme the user picked in the app.
        const themeMode = theme.colorScheme === CONST.COLOR_SCHEME.DARK ? ThemeMode.Dark : ThemeMode.Light;
        const brandColors: ThemeColors = {
            backgroundColorBrandDefault: theme.success,
            backgroundColorBrandHover: theme.successHover,
            backgroundColorBrandActive: theme.successPressed,
            borderColorBrandDefault: theme.success,
            borderColorBrandHover: theme.successHover,
            borderColorBrandActive: theme.successPressed,
            contentColorBrandOnBrand: theme.buttonSuccessText,
        };

        // The SDK subscribes to its native events in the EntrustIdv constructor and never unsubscribes, so the listeners of earlier
        // mounts stay registered, and Android can fire the same callback twice. Only the first callback of a live mount is handled.
        let hasSettled = false;
        // Back is exposed while the SDK is still running, so a late callback could navigate or mutate wallet/bank-account state
        // after the user has already left. The Android relaunch check and the iOS permission check resolve asynchronously too.
        let isMounted = true;
        const settle = () => {
            if (hasSettled) {
                return false;
            }
            hasSettled = true;
            return true;
        };
        const handleUserExit: OnfidoProps['onUserExit'] = (isUserInitiated) => {
            if (!isMounted) {
                return;
            }
            onUserExit(isUserInitiated);
        };
        const handleError: OnfidoProps['onError'] = (error) => {
            if (!isMounted) {
                return;
            }
            onError(error);
        };

        const entrustIdv = new EntrustIdv({
            onComplete: (result) => {
                if (!settle()) {
                    return;
                }
                onSuccess(convertEntrustResultToOnfidoPayload(result));
            },
            onUserExit: (userAction) => {
                if (!settle()) {
                    return;
                }
                Log.info('Onfido flow exited by user on native', false, {userAction});

                // Android can kill the app while the SDK is in the foreground. If the user relaunched the app from its icon,
                // the exit was not something they chose, so we don't treat it as user initiated.
                if (getPlatform() === CONST.PLATFORM.ANDROID) {
                    AppStateTracker.getWasAppRelaunchedFromIcon().then((wasAppRelaunchedFromIcon) => {
                        handleUserExit(!wasAppRelaunchedFromIcon);
                    });
                    return;
                }

                handleUserExit(true);
            },
            onError: (error) => {
                if (!settle()) {
                    return;
                }
                const errorMessage: string = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
                Log.hmmm('Onfido error on native', {errorType: getNativeOnfidoErrorType(error.type), errorCategory: error.category, errorMessage});

                // Only a permission error should lead to the permissions alert. Other errors, like an expired token, are reported as they are.
                if (getPlatform() !== CONST.PLATFORM.IOS || !isNativeOnfidoPermissionError(error)) {
                    handleError(errorMessage);
                    return;
                }

                checkMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.CAMERA])
                    .then((statuses) => {
                        // The user may have already backed out by the time the check settles. Skip the alert to avoid showing a stale permission prompt on the screen they returned to.
                        if (!isMounted) {
                            return;
                        }
                        const isMicAllowed = statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED;
                        const isCameraAllowed = statuses[PERMISSIONS.IOS.CAMERA] === RESULTS.GRANTED;
                        let alertTitle: TranslationPaths | '' = '';
                        let alertMessage: TranslationPaths | '' = '';
                        if (!isCameraAllowed) {
                            alertTitle = 'onfidoStep.cameraPermissionsNotGranted';
                            alertMessage = 'onfidoStep.cameraRequestMessage';
                        } else if (!isMicAllowed) {
                            alertTitle = 'onfidoStep.microphonePermissionsNotGranted';
                            alertMessage = 'onfidoStep.microphoneRequestMessage';
                        }

                        if (!!alertTitle && !!alertMessage) {
                            Alert.alert(
                                translate(alertTitle),
                                translate(alertMessage),
                                [
                                    {
                                        text: translate('common.cancel'),
                                        onPress: () => handleUserExit(true),
                                    },
                                    {
                                        text: translate('common.settings'),
                                        onPress: () => {
                                            handleUserExit();
                                            goToSettings();
                                        },
                                    },
                                ],
                                {cancelable: false},
                            );
                            return;
                        }
                        handleError(errorMessage);
                    })
                    .catch(() => {
                        handleError(errorMessage);
                    });
            },
        });

        entrustIdv.start({
            sdkToken,
            steps: [
                Welcome(),
                // Matches the documents the web flow accepts: US driving licenses and passports from any country
                Document({
                    nfcPolicy: 'Disabled',
                    documentFiltering: {
                        include: [
                            {documentType: DocumentType.DrivingLicence, issuingCountry: CONST.ONFIDO.DOCUMENT_COUNTRY_CODE},
                            {documentType: DocumentType.Passport, allCountries: true},
                        ],
                    },
                }),
                // The video variant is what the web flow and the previous native SDK captured. The previous native SDK also recorded audio,
                // which is why we still ask for microphone access above.
                FaceVideo({recordAudio: true}),
            ],
            configuration: {
                theme: {
                    mode: themeMode,
                    // Our success colors are identical in the light and dark app themes, so both modes get the same brand colors
                    lightColors: brandColors,
                    darkColors: brandColors,
                },
            },
        });

        return () => {
            hasSettled = true;
            isMounted = false;
        };
        // The SDK should be started only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ActivityIndicator
            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
            style={styles.flex1}
        />
    );
}

export default Onfido;
