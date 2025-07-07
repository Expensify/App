"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var onfido_sdk_ui_1 = require("onfido-sdk-ui");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var Log_1 = require("@libs/Log");
var FontUtils_1 = require("@styles/utils/FontUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var LOCALES_1 = require("@src/CONST/LOCALES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
require("./index.css");
function initializeOnfido(_a) {
    var sdkToken = _a.sdkToken, onSuccess = _a.onSuccess, onError = _a.onError, onUserExit = _a.onUserExit, preferredLocale = _a.preferredLocale, translate = _a.translate, theme = _a.theme;
    onfido_sdk_ui_1.Onfido.init({
        token: sdkToken,
        containerId: CONST_1.default.ONFIDO.CONTAINER_ID,
        customUI: {
            // Font styles are commented out until Onfido fixes it on their side, more info here - https://github.com/Expensify/App/issues/44570
            // For now we will use Onfido default font which is better than random serif font which it started defaulting to
            // fontFamilyTitle: `${FontUtils.fontFamily.platform.EXP_NEUE.fontFamily}, -apple-system, serif`,
            // fontFamilySubtitle: `${FontUtils.fontFamily.platform.EXP_NEUE.fontFamily}, -apple-system, serif`,
            // fontFamilyBody: `${FontUtils.fontFamily.platform.EXP_NEUE.fontFamily}, -apple-system, serif`,
            fontSizeTitle: "".concat(variables_1.default.fontSizeLarge, "px"),
            fontWeightTitle: Number(FontUtils_1.default.fontWeight.bold),
            fontWeightSubtitle: Number(FontUtils_1.default.fontWeight.normal),
            fontSizeSubtitle: "".concat(variables_1.default.fontSizeNormal, "px"),
            colorContentTitle: theme.text,
            colorContentSubtitle: theme.text,
            colorContentBody: theme.text,
            borderRadiusButton: "".concat(variables_1.default.buttonBorderRadius, "px"),
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
                type: CONST_1.default.ONFIDO.TYPE.DOCUMENT,
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
                type: CONST_1.default.ONFIDO.TYPE.FACE,
                options: {
                    requestedVariant: CONST_1.default.ONFIDO.VARIANT.VIDEO,
                },
            },
        ],
        onComplete: function (data) {
            if ((0, EmptyObject_1.isEmptyObject)(data)) {
                Log_1.default.warn('Onfido completed with no data');
            }
            onSuccess(data);
        },
        onError: function (error) {
            var _a;
            var errorType = error.type;
            var errorMessage = (_a = error.message) !== null && _a !== void 0 ? _a : CONST_1.default.ERROR.UNKNOWN_ERROR;
            Log_1.default.hmmm('Onfido error', { errorType: errorType, errorMessage: errorMessage });
            if (errorType === CONST_1.default.WALLET.ERROR.ONFIDO_USER_CONSENT_DENIED) {
                onUserExit();
                return;
            }
            onError(errorMessage);
        },
        language: {
            // We need to use ES_ES as locale key because the key `ES` is not a valid config key for Onfido
            locale: preferredLocale === CONST_1.default.LOCALES.ES ? LOCALES_1.EXTENDED_LOCALES.ES_ES_ONFIDO : (preferredLocale !== null && preferredLocale !== void 0 ? preferredLocale : CONST_1.default.LOCALES.DEFAULT),
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
function logOnFidoEvent(event) {
    Log_1.default.hmmm('Receiving Onfido analytic event', event.detail);
}
function Onfido(_a, ref) {
    var sdkToken = _a.sdkToken, onSuccess = _a.onSuccess, onError = _a.onError, onUserExit = _a.onUserExit;
    var _b = (0, useLocalize_1.default)(), preferredLocale = _b.preferredLocale, translate = _b.translate;
    var theme = (0, useTheme_1.default)();
    (0, react_1.useEffect)(function () {
        initializeOnfido({
            sdkToken: sdkToken,
            onSuccess: onSuccess,
            onError: onError,
            onUserExit: onUserExit,
            preferredLocale: preferredLocale,
            translate: translate,
            theme: theme,
        });
        window.addEventListener('userAnalyticsEvent', logOnFidoEvent);
        return function () { return window.removeEventListener('userAnalyticsEvent', logOnFidoEvent); };
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<div id={CONST_1.default.ONFIDO.CONTAINER_ID} ref={ref}/>);
}
Onfido.displayName = 'Onfido';
exports.default = (0, react_1.forwardRef)(Onfido);
