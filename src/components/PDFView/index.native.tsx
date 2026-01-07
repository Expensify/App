import React, {useCallback, useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Linking, View} from 'react-native';
import PDF from 'react-native-pdf';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import LoadingIndicator from '@components/LoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {getRelativeUrl, isTravelLink} from '@libs/TravelUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFPasswordForm from './PDFPasswordForm';
import type {PDFViewNativeProps} from './types';

/**
 * On the native layer, we use react-native-pdf/PDF to display PDFs. If a PDF is
 * password-protected we render a PDFPasswordForm to request a password
 * from the user.
 *
 * In order to render things nicely during a password challenge we need
 * to keep track of additional state. In particular, the
 * react-native-pdf/PDF component is both conditionally rendered and hidden
 * depending upon the situation. It needs to be rerendered on each password
 * submission because it doesn't dynamically handle updates to its
 * password property. And we need to hide it during password challenges
 * so that PDFPasswordForm doesn't bounce when react-native-pdf/PDF
 * is (temporarily) rendered.
 */

const LOADING_THUMBNAIL_HEIGHT = 250;
const LOADING_THUMBNAIL_WIDTH = 250;

function PDFView({onToggleKeyboard, onLoadComplete, fileName, onPress, isFocused, onScaleChanged, sourceURL, onLoadError, isUsedAsChatAttachment}: PDFViewNativeProps) {
    const [shouldRequestPassword, setShouldRequestPassword] = useState(false);
    const [shouldAttemptPDFLoad, setShouldAttemptPDFLoad] = useState(true);
    const [shouldShowLoadingIndicator, setShouldShowLoadingIndicator] = useState(true);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
    const [failedToLoadPDF, setFailedToLoadPDF] = useState(false);
    const [successToLoadPDF, setSuccessToLoadPDF] = useState(false);
    const [password, setPassword] = useState('');
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const themeStyles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const StyleUtils = useStyleUtils();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    useEffect(() => {
        onToggleKeyboard?.(isKeyboardShown);
    });

    /**
     * Initiate password challenge if message received from react-native-pdf/PDF
     * indicates that a password is required or invalid.
     *
     * For a password challenge the message is "Password required or incorrect password."
     * Note that the message doesn't specify whether the password is simply empty or
     * invalid.
     */

    const initiatePasswordChallenge = useCallback(() => {
        setShouldShowLoadingIndicator(false);

        // Render password form, and don't render PDF and loading indicator.
        setShouldRequestPassword(true);
        setShouldAttemptPDFLoad(false);

        // The message provided by react-native-pdf doesn't indicate whether this
        // is an initial password request or if the password is invalid. So we just assume
        // that if a password was already entered then it's an invalid password error.
        if (password) {
            setIsPasswordInvalid(true);
        }
    }, [password]);

    const handleFailureToLoadPDF = ((error: Error) => {
        if (error.message.match(/password/i)) {
            initiatePasswordChallenge();
            return;
        }
        setFailedToLoadPDF(true);
        setShouldShowLoadingIndicator(false);
        setShouldRequestPassword(false);
        setShouldAttemptPDFLoad(false);
        onLoadError?.();
        // eslint-disable-next-line @typescript-eslint/no-restricted-types
    }) as (error: object) => void;

    /**
     * When the password is submitted via PDFPasswordForm, save the password
     * in state and attempt to load the PDF. Also show the loading indicator
     * since react-native-pdf/PDF will need to reload the PDF.
     *
     * @param pdfPassword Password submitted via PDFPasswordForm
     */
    const attemptPDFLoadWithPassword = (pdfPassword: string) => {
        // Render react-native-pdf/PDF so that it can validate the password.
        // Note that at this point in the password challenge, shouldRequestPassword is true.
        // Thus react-native-pdf/PDF will be rendered - but not visible.
        setPassword(pdfPassword);
        setShouldAttemptPDFLoad(true);
        setShouldShowLoadingIndicator(true);
    };

    /**
     * After the PDF is successfully loaded hide PDFPasswordForm and the loading
     * indicator.
     * @param numberOfPages
     * @param path - Path to cache location
     */
    const finishPDFLoad = (numberOfPages: number, path: string) => {
        setShouldRequestPassword(false);
        setShouldShowLoadingIndicator(false);
        setSuccessToLoadPDF(true);
        onLoadComplete(path);
    };

    /**
     * Handle press link event on native apps.
     */
    const handlePressLink = useCallback(
        (url: string) => {
            if (isTravelLink(url) && activePolicyID) {
                const postLoginPath = getRelativeUrl(url);
                openTravelDotLink(activePolicyID, postLoginPath);
                return;
            }
            Linking.openURL(url);
        },
        [activePolicyID],
    );

    function renderPDFView() {
        const pdfWidth = isUsedAsChatAttachment ? LOADING_THUMBNAIL_WIDTH : windowWidth;
        const pdfHeight = isUsedAsChatAttachment ? LOADING_THUMBNAIL_HEIGHT : windowHeight;
        const pdfStyles: StyleProp<ViewStyle> = [themeStyles.imageModalPDF, StyleUtils.getWidthAndHeightStyle(pdfWidth, pdfHeight)];

        // If we haven't yet successfully validated the password and loaded the PDF,
        // then we need to hide the react-native-pdf/PDF component so that PDFPasswordForm
        // is positioned nicely. We're specifically hiding it because we still need to render
        // the PDF component so that it can validate the password.
        if (shouldRequestPassword) {
            pdfStyles.push(themeStyles.invisible);
        }
        const containerStyles =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            isUsedAsChatAttachment || (shouldRequestPassword && shouldUseNarrowLayout) ? [themeStyles.w100, themeStyles.flex1] : [themeStyles.alignItemsCenter, themeStyles.flex1];
        const loadingIndicatorStyles = isUsedAsChatAttachment
            ? [themeStyles.chatItemPDFAttachmentLoading, StyleUtils.getWidthAndHeightStyle(LOADING_THUMBNAIL_WIDTH, LOADING_THUMBNAIL_HEIGHT)]
            : [];

        return (
            <View style={containerStyles}>
                {shouldAttemptPDFLoad && (
                    <PDF
                        fitPolicy={0}
                        trustAllCerts={false}
                        renderActivityIndicator={() => <LoadingIndicator style={loadingIndicatorStyles} />}
                        source={{uri: sourceURL, cache: true, expiration: 864000}}
                        style={pdfStyles}
                        onError={handleFailureToLoadPDF}
                        password={password}
                        onLoadComplete={finishPDFLoad}
                        onPageSingleTap={onPress}
                        onScaleChanged={onScaleChanged}
                        onPressLink={handlePressLink}
                    />
                )}
                {shouldRequestPassword && (
                    <KeyboardAvoidingView style={themeStyles.flex1}>
                        <PDFPasswordForm
                            isFocused={!!isFocused}
                            onSubmit={attemptPDFLoadWithPassword}
                            onPasswordUpdated={() => setIsPasswordInvalid(false)}
                            isPasswordInvalid={isPasswordInvalid}
                            shouldShowLoadingIndicator={shouldShowLoadingIndicator}
                        />
                    </KeyboardAvoidingView>
                )}
            </View>
        );
    }

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            fullDisabled={successToLoadPDF}
            style={[themeStyles.flex1, themeStyles.alignSelfStretch, !failedToLoadPDF && themeStyles.flexRow]}
            accessibilityRole={CONST.ROLE.BUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

export default PDFView;
