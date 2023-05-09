import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import QRCode from '../components/QRCode';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
class ShareCodePage extends React.Component {
    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.shareCode')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <View>
                    <QRCode />
                </View>

                <View />
            </ScreenWrapper>
        );
    }
}

ShareCodePage.propTypes = propTypes;
ShareCodePage.defaultProps = defaultProps;

export default withLocalize(ShareCodePage);
