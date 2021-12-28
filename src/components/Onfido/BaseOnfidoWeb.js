import _ from 'underscore';
import './index.css';
import lodashGet from 'lodash/get';
import React from 'react';
import * as OnfidoSDK from 'onfido-sdk-ui';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';
import variables from '../../styles/variables';
import colors from '../../styles/colors';
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
                fontFamilyTitle: `${fontFamily.GTA}, -apple-system, serif`,
                fontFamilySubtitle: `${fontFamily.GTA}, -apple-system, serif`,
                fontFamilyBody: `${fontFamily.GTA}, -apple-system, serif`,
                fontSizeTitle: `${variables.fontSizeLarge}px`,
                fontWeightTitle: fontWeightBold,
                fontWeightSubtitle: 400,
                fontSizeSubtitle: `${variables.fontSizeNormal}px`,
                colorContentTitle: colors.dark,
                colorContentSubtitle: colors.dark,
                colorContentBody: colors.dark,
                borderRadiusButton: `${variables.componentBorderRadius}px`,
                colorBackgroundSurfaceModal: colors.white,
                colorBorderDocTypeButton: colors.gray2,
                colorBorderDocTypeButtonHover: colors.blue,
                colorBackgroundButtonPrimary: colors.green,
                colorBackgroundButtonPrimaryHover: colors.greenHover,
                colorBackgroundButtonPrimaryActive: colors.greenHover,
                colorBorderButtonPrimary: colors.green,
                colorContentButtonSecondaryText: colors.dark,
                colorBackgroundButtonSecondary: colors.gray2,
                colorBackgroundButtonSecondaryHover: colors.gray3,
                colorBackgroundButtonSecondaryActive: colors.gray3,
                colorBorderButtonSecondary: colors.gray2,
                colorBackgroundIcon: colors.white,
                colorContentLinkTextHover: colors.white,
                colorBorderLinkUnderline: colors.blue,
                colorBackgroundLinkHover: colors.blue,
                colorBackgroundLinkActive: colors.blue,
                authAccentColor: colors.blue,
                colorBackgroundInfoPill: colors.blue,
            },
            steps: [
                {
                    type: CONST.ONFIDO.TYPE.DOCUMENT,
                    options: {
                        useLiveDocumentCapture: true,
                        forceCrossDevice: true,
                        showCountrySelection: false,
                        documentTypes: {
                            driving_licence: {
                                country: null,
                            },
                            national_identity_card: {
                                country: null,
                            },
                            residence_permit: {
                                country: null,
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
