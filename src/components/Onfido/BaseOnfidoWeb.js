import lodashGet from 'lodash/get';
import * as OnfidoSDK from 'onfido-sdk-ui';
import React, {forwardRef, useEffect} from 'react';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Log from '@libs/Log';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import './index.css';
import onfidoPropTypes from './onfidoPropTypes';

function initializeOnfido({sdkToken, onSuccess, onError, onUserExit, preferredLocale, translate, theme}) {
    OnfidoSDK.init({
        token: sdkToken,
        containerId: CONST.ONFIDO.CONTAINER_ID,
        useMemoryHistory: true,
        customUI: {
            fontFamilyTitle: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontFamilySubtitle: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontFamilyBody: `${FontUtils.fontFamily.platform.EXP_NEUE}, -apple-system, serif`,
            fontSizeTitle: `${variables.fontSizeLarge}px`,
            fontWeightTitle: FontUtils.fontWeight.bold,
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
            authAccentColor: theme.link,
            colorBackgroundInfoPill: theme.link,
            colorBackgroundSelector: theme.appBG,
            colorBackgroundDocTypeButton: theme.success,
            colorBackgroundDocTypeButtonHover: theme.successHover,
            colorBackgroundButtonIconHover: theme.transparent,
            colorBackgroundButtonIconActive: theme.transparent,
        },
        steps: [
            {
                type: CONST.ONFIDO.TYPE.DOCUMENT,
                options: {
                    useLiveDocumentCapture: true,
                    forceCrossDevice: true,
                    hideCountrySelection: true,
                    country: 'USA',
                    documentTypes: {
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
        smsNumberCountryCode: CONST.ONFIDO.SMS_NUMBER_COUNTRY_CODE.US,
        showCountrySelection: false,
        onComplete: (data) => {
            if (_.isEmpty(data)) {
                Log.warn('Onfido completed with no data');
            }
            onSuccess(data);
        },
        onError: (error) => {
            const errorMessage = lodashGet(error, 'message', CONST.ERROR.UNKNOWN_ERROR);
            const errorType = lodashGet(error, 'type');
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
            locale: preferredLocale === CONST.LOCALES.ES ? CONST.LOCALES.ES_ES_ONFIDO : preferredLocale,

            // Provide a custom phrase for the back button so that the first letter is capitalized,
            // and translate the phrase while we're at it. See the issue and documentation for more context.
            // https://github.com/Expensify/App/issues/17244
            // https://documentation.onfido.com/sdk/web/#custom-languages
            phrases: {
                'generic.back': translate('common.back'),
            },
        },
    });
}

function logOnFidoEvent(event) {
    Log.hmmm('Receiving Onfido analytic event', event.detail);
}

const Onfido = forwardRef((props, ref) => {
    const {preferredLocale, translate} = useLocalize();
    const theme = useTheme();

    useEffect(() => {
        initializeOnfido({
            sdkToken: props.sdkToken,
            onSuccess: props.onSuccess,
            onError: props.onError,
            onUserExit: props.onUserExit,
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
});

Onfido.displayName = 'Onfido';
Onfido.propTypes = onfidoPropTypes;
export default Onfido;
