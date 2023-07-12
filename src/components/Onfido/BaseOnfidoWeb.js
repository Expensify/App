import _ from 'underscore';
import './index.css';
import lodashGet from 'lodash/get';
import React, {useEffect, forwardRef} from 'react';
import * as OnfidoSDK from 'onfido-sdk-ui';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';
import variables from '../../styles/variables';
import themeColors from '../../styles/themes/default';
import fontWeightBold from '../../styles/fontWeight/bold';
import fontFamily from '../../styles/fontFamily';
import Log from '../../libs/Log';

const propTypes = {
    ...withLocalizePropTypes,
    ...onfidoPropTypes,
};

function initializeOnfido({sdkToken, onSuccess, onError, onUserExit, preferredLocale, translate}) {
    OnfidoSDK.init({
        token: sdkToken,
        containerId: CONST.ONFIDO.CONTAINER_ID,
        useMemoryHistory: true,
        customUI: {
            fontFamilyTitle: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontFamilySubtitle: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontFamilyBody: `${fontFamily.EXP_NEUE}, -apple-system, serif`,
            fontSizeTitle: `${variables.fontSizeLarge}px`,
            fontWeightTitle: fontWeightBold,
            fontWeightSubtitle: 400,
            fontSizeSubtitle: `${variables.fontSizeNormal}px`,
            colorContentTitle: themeColors.text,
            colorContentSubtitle: themeColors.text,
            colorContentBody: themeColors.text,
            borderRadiusButton: `${variables.buttonBorderRadius}px`,
            colorBackgroundSurfaceModal: themeColors.appBG,
            colorBorderDocTypeButton: themeColors.border,
            colorBorderDocTypeButtonHover: themeColors.link,
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
            authAccentColor: themeColors.link,
            colorBackgroundInfoPill: themeColors.link,
            colorBackgroundSelector: themeColors.appBG,
            colorBackgroundDocTypeButton: themeColors.success,
            colorBackgroundDocTypeButtonHover: themeColors.successHover,
        },
        steps: [
            {
                type: CONST.ONFIDO.TYPE.DOCUMENT,
                options: {
                    useLiveDocumentCapture: true,
                    forceCrossDevice: true,
                    hideCountrySelection: true,
                    country: 'USA',
                    uploadFallback: false,
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
                    uploadFallback: false,
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

const Onfido = forwardRef((props, ref) => {
    useEffect(() => {
        initializeOnfido({
            sdkToken: props.sdkToken,
            onSuccess: props.onSuccess,
            onError: props.onError,
            onUserExit: props.onUserExit,
            preferredLocale: props.preferredLocale,
            translate: props.translate,
        });

        const logOnFidoEvent = (event) => Log.hmmm('Receiving Onfido analytic event', event.detail);

        window.addEventListener('userAnalyticsEvent', logOnFidoEvent);
        return () => window.addEventListener('userAnalyticsEvent', logOnFidoEvent);
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

Onfido.propTypes = propTypes;
export default withLocalize(Onfido);
