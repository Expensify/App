import * as OnfidoSDK from 'onfido-sdk-ui';
import React, {ForwardedRef, forwardRef, useEffect} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import fontFamily from '@styles/fontFamily';
import fontWeightBold from '@styles/fontWeight/bold';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import './index.css';
import type {OnfidoElement, OnfidoProps} from './types';

type LocaleProps = Pick<LocaleContextProps, 'translate' | 'preferredLocale'>;

type OnfidoEvent = Event & {
    detail?: Record<string, unknown>;
};

function initializeOnfido({sdkToken, onSuccess, onError, onUserExit, preferredLocale, translate}: OnfidoProps & LocaleProps) {
    OnfidoSDK.init({
        token: sdkToken,
        containerId: CONST.ONFIDO.CONTAINER_ID,
        useMemoryHistory: true,
        customUI: {
            fontFamilyTitle: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontFamilySubtitle: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontFamilyBody: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontSizeTitle: `${variables.fontSizeLarge}px`,
            fontWeightTitle: Number(fontWeightBold),
            fontWeightSubtitle: 400,
            fontSizeSubtitle: `${variables.fontSizeNormal}px`,
            colorContentTitle: themeColors.text,
            colorContentSubtitle: themeColors.text,
            colorContentBody: themeColors.text,
            borderRadiusButton: `${variables.buttonBorderRadius}px`,
            colorBackgroundSurfaceModal: themeColors.appBG,
            colorBorderDocTypeButton: themeColors.border,
            colorBorderDocTypeButtonHover: themeColors.transparent,
            colorBorderButtonPrimaryHover: themeColors.transparent,
            colorBackgroundButtonPrimary: themeColors.success,
            colorBackgroundButtonPrimaryHover: themeColors.successHover,
            colorBackgroundButtonPrimaryActive: themeColors.successHover,
            colorBorderButtonPrimary: themeColors.success,
            colorContentButtonSecondaryText: themeColors.text,
            colorBackgroundButtonSecondary: themeColors.border,
            colorBackgroundButtonSecondaryHover: themeColors.icon,
            colorBackgroundButtonSecondaryActive: themeColors.icon,
            colorBorderButtonSecondary: themeColors.border,
            colorBackgroundIcon: themeColors.transparent,
            colorContentLinkTextHover: themeColors.appBG,
            colorBorderLinkUnderline: themeColors.link,
            colorBackgroundLinkHover: themeColors.link,
            colorBackgroundLinkActive: themeColors.link,
            colorBackgroundInfoPill: themeColors.link,
            colorBackgroundSelector: themeColors.appBG,
            colorBackgroundDocTypeButton: themeColors.success,
            colorBackgroundDocTypeButtonHover: themeColors.successHover,
            colorBackgroundButtonIconHover: themeColors.transparent,
            colorBackgroundButtonIconActive: themeColors.transparent,
        },
        steps: [
            {
                type: CONST.ONFIDO.TYPE.DOCUMENT,
                options: {
                    forceCrossDevice: true,
                    hideCountrySelection: true,
                    documentTypes: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        driving_licence: {
                            country: 'USA',
                        },
                        passport: true,
                    },
                },
            },
            {
                type: CONST.ONFIDO.TYPE.FACE,
                options: {
                    requestedVariant: CONST.ONFIDO.VARIANT.VIDEO,
                },
            },
        ],
        onComplete: (data) => {
            if (!Object.keys(data).length) {
                Log.warn('Onfido completed with no data');
            }
            onSuccess(data);
        },
        onError: (error) => {
            const errorMessage = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
            const errorType = error.type;
            Log.hmmm('Onfido error', {errorType, errorMessage});
            onError(errorMessage);
        },
        onUserExit: (userExitCode) => {
            Log.hmmm('Onfido user exits the flow', {userExitCode});
            onUserExit(userExitCode);
        },
        onModalRequestClose: () => {
            Log.hmmm('Onfido user closed the modal');
        },
        language: {
            // We need to use ES_ES as locale key because the key `ES` is not a valid config key for Onfido
            locale: preferredLocale === CONST.LOCALES.ES ? CONST.LOCALES.ES_ES_ONFIDO : (preferredLocale as OnfidoSDK.SupportedLanguages),

            // Provide a custom phrase for the back button so that the first letter is capitalized,
            // and translate the phrase while we're at it. See the issue and documentation for more context.
            // https://github.com/Expensify/App/issues/17244
            // https://documentation.onfido.com/sdk/web/#custom-languages
            phrases: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'generic.back': translate('common.back'),
            },
        },
    });
}

function logOnFidoEvent(event: OnfidoEvent) {
    Log.hmmm('Receiving Onfido analytic event', event.detail);
}

function Onfido({sdkToken, onSuccess, onError, onUserExit}: OnfidoProps, ref: ForwardedRef<OnfidoElement>) {
    const {preferredLocale, translate} = useLocalize();

    useEffect(() => {
        initializeOnfido({
            sdkToken,
            onSuccess,
            onError,
            onUserExit,
            preferredLocale,
            translate,
        });

        window.addEventListener('userAnalyticsEvent', logOnFidoEvent);
        return () => window.removeEventListener('userAnalyticsEvent', logOnFidoEvent);
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            id={CONST.ONFIDO.CONTAINER_ID}
            ref={ref}
        />
    );
}

Onfido.displayName = 'Onfido';

export default forwardRef(Onfido);
