import ActivityIndicator from '@components/ActivityIndicator';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';
import goToSettings from '@libs/goToSettings';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {CaptureResult} from '@entrust.corporation/idvsdk-reactnative/callbacks/complete';
import type {ThemeColors} from '@entrust.corporation/idvsdk-reactnative/theming/Theme';

import {EntrustIdv} from '@entrust.corporation/idvsdk-reactnative';
import {Document, DocumentType} from '@entrust.corporation/idvsdk-reactnative/steps/Document';
import {FaceVideo} from '@entrust.corporation/idvsdk-reactnative/steps/Face';
import {StepNames} from '@entrust.corporation/idvsdk-reactnative/steps/Step';
import {Welcome} from '@entrust.corporation/idvsdk-reactnative/steps/Welcome';
import React, {useEffect} from 'react';
import {Alert, NativeModules} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';

import type {NativeOnfidoResult, OnfidoProps} from './types';

const {AppStateTracker} = NativeModules;

/** Converts the Entrust IDV result, keyed by step, into the payload shape the backend expects from native clients */
function convertToNativeOnfidoResult(result: Record<string, CaptureResult>): NativeOnfidoResult {
    const nativeResult: NativeOnfidoResult = {};
    for (const captureResult of Object.values(result)) {
        if (captureResult.type === StepNames.Document && captureResult.sides.front) {
            nativeResult.document = {
                front: {id: captureResult.sides.front.id},
                back: captureResult.sides.back ? {id: captureResult.sides.back.id} : undefined,
            };
        } else if (captureResult.type === StepNames.FaceVideo) {
            nativeResult.face = {id: captureResult.id, variant: CONST.ONFIDO.NATIVE_FACE_VARIANT.VIDEO};
        }
    }
    return nativeResult;
}

function Onfido({sdkToken, onUserExit, onSuccess, onError}: OnfidoProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    useEffect(() => {
        // The SDK follows the device's light or dark mode, not the app's, so both modes get the same brand colors.
        // Our success colors are identical in the light and dark app themes, which keeps this correct whichever one is active.
        const brandColors: ThemeColors = {
            backgroundColorBrandDefault: theme.success,
            backgroundColorBrandHover: theme.successHover,
            backgroundColorBrandActive: theme.successPressed,
            borderColorBrandDefault: theme.success,
            borderColorBrandHover: theme.successHover,
            borderColorBrandActive: theme.successPressed,
            contentColorBrandOnBrand: theme.buttonSuccessText,
        };

        // Back is exposed while the SDK is still running, so a late callback could navigate or mutate
        // wallet/bank-account state after the user has already left. Ignore the callbacks once this component unmounts.
        let isActive = true;
        const handleUserExit: OnfidoProps['onUserExit'] = (isUserInitiated) => {
            if (!isActive) {
                return;
            }
            onUserExit(isUserInitiated);
        };
        const handleError: OnfidoProps['onError'] = (error) => {
            if (!isActive) {
                return;
            }
            onError(error);
        };

        const entrustIdv = new EntrustIdv({
            onComplete: (result) => {
                if (!isActive) {
                    return;
                }
                onSuccess(convertToNativeOnfidoResult(result));
            },
            onUserExit: (userAction) => {
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
                const errorMessage: string = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
                Log.hmmm('Onfido error on native', {errorType: error.type, errorCategory: error.category, errorMessage});

                if (!errorMessage || getPlatform() !== CONST.PLATFORM.IOS) {
                    handleError(errorMessage);
                    return;
                }

                checkMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.CAMERA])
                    .then((statuses) => {
                        // The permission check resolves asynchronously, so the user may have already backed out (unmounting this
                        // component) by the time it settles. Skip the alert to avoid showing a stale permission prompt on the screen they returned to.
                        if (!isActive) {
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
                    lightColors: brandColors,
                    darkColors: brandColors,
                },
            },
        });

        return () => {
            isActive = false;
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
