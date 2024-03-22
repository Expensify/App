import {Onfido as OnfidoSDK} from 'onfido-sdk-ui';
import React, {forwardRef, useEffect} from 'react';
import type {ForwardedRef} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Log from '@libs/Log';
import type {ThemeColors} from '@styles/theme/types';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import './index.css';
import type {OnfidoElement, OnfidoProps} from './types';

type InitializeOnfidoProps = OnfidoProps &
    Pick<LocaleContextProps, 'translate' | 'preferredLocale'> & {
        theme: ThemeColors;
    };

type OnfidoEvent = Event & {
    detail?: Record<string, unknown>;
};

function initializeOnfido({sdkToken, onSuccess, onError, onUserExit, preferredLocale, translate, theme}: InitializeOnfidoProps) {
    OnfidoSDK.init({
        token: sdkToken,
        containerId: CONST.ONFIDO.CONTAINER_ID,
        customUI: {
            fontFamilyTitle: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontFamilySubtitle: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontFamilyBody: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontSizeTitle: `${variables.fontSizeLarge}px`,
            fontWeightTitle: Number(FontUtils.fontWeight.bold),
            fontWeightSubtitle: 400,
            fontSizeSubtitle: `${variables.fontSizeNormal}px`,
            colorContentTitle: theme.text,
            colorContentSubtitle: theme.text,
            colorContentBody: theme.text,
            borderRadiusButton: `${variables.buttonBorderRadius}px`,
            colorBackgroundSurfaceModal: theme.appBG,
            colorBorderDocTypeButton: theme.border,
            colorBorderDocTypeButtonHover: theme.transparent,
            colorBorderButtonPrimaryHover: theme.transparent,
            colorBackgroundButtonPrimary: theme.success,
            colorBackgroundButtonPrimaryHover: theme.successHover,
            colorBackgroundButtonPrimaryActive: theme.successHover,
            colorBorderButtonPrimary: theme.success,
            colorContentButtonSecondaryText: theme.text,
            colorBackgroundButtonSecondary: theme.border,
            colorBackgroundButtonSecondaryHover: theme.icon,
            colorBackgroundButtonSecondaryActive: theme.icon,
            colorBorderButtonSecondary: theme.border,
            colorBackgroundIcon: theme.transparent,
            colorContentLinkTextHover: theme.appBG,
            colorBorderLinkUnderline: theme.link,
            colorBackgroundLinkHover: theme.link,
            colorBackgroundLinkActive: theme.link,
            colorBackgroundInfoPill: theme.link,
            colorBackgroundSelector: theme.appBG,
            colorBackgroundDocTypeButton: theme.success,
            borderWidthSurfaceModal: '0px',
            colorBackgroundDocTypeButtonHover: theme.successHover,
            colorBackgroundButtonIconHover: theme.transparent,
            colorBackgroundButtonIconActive: theme.transparent,
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
            if (isEmptyObject(data)) {
                Log.warn('Onfido completed with no data');
            }
            onSuccess(data);
        },
        onError: (error) => {
            const errorType = error.type;
            const errorMessage = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
            Log.hmmm('Onfido error', {errorType, errorMessage});
            if (errorType === CONST.WALLET.ERROR.ONFIDO_USER_CONSENT_DENIED) {
                onUserExit();
                return;
            }
            onError(errorMessage);
        },
        language: {
            // We need to use ES_ES as locale key because the key `ES` is not a valid config key for Onfido
            locale: preferredLocale === CONST.LOCALES.ES ? CONST.LOCALES.ES_ES_ONFIDO : preferredLocale,

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
    const theme = useTheme();

    useEffect(() => {
        initializeOnfido({
            sdkToken,
            onSuccess,
            onError,
            onUserExit,
            preferredLocale,
            translate,
            theme,
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
