import _ from 'underscore';
import './index.css';
import lodashGet from 'lodash/get';
import React from 'react';
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

class Onfido extends React.Component {
    componentDidMount() {
        this.onfidoOut = OnfidoSDK.init({
            token: this.props.sdkToken,
            containerId: CONST.ONFIDO.CONTAINER_ID,
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
                this.props.onSuccess(data);
            },
            onError: (error) => {
                const errorMessage = lodashGet(error, 'message', CONST.ERROR.UNKNOWN_ERROR);
                const errorType = lodashGet(error, 'type');
                Log.hmmm('Onfido error', {errorType, errorMessage});
                this.props.onError(errorMessage);
            },
            onUserExit: (userExitCode) => {
                Log.hmmm('Onfido user exits the flow', {userExitCode});
                this.props.onUserExit(userExitCode);
            },
            onModalRequestClose: () => {
                Log.hmmm('Onfido user closed the modal');
            },
            language: this.props.preferredLocale,
        });

        window.addEventListener('userAnalyticsEvent', (event) => {
            Log.hmmm('Receiving Onfido analytic event', event.detail);
        });
    }

    render() {
        return (
            <div id={CONST.ONFIDO.CONTAINER_ID} />
        );
    }
}

Onfido.propTypes = propTypes;
export default withLocalize(Onfido);
