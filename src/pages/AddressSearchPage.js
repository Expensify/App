import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import KeyboardSpacer from '../components/KeyboardSpacer';
import Navigation from '../libs/Navigation/Navigation';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';

import AddressSearch from '../components/AddressSearch';

const propTypes = {
    /* Onyx Props */

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

class AddressSearchPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const addressStreet = lodashGet(this.props.address, 'addressStreet', '');
        const addressCity = lodashGet(this.props.address, 'addressCity', '');
        const addressState = lodashGet(this.props.address, 'addressState', '');
        const addressZipCode = lodashGet(this.props.address, 'addressZipCode', '');
        const fullAddress = _.compact([addressStreet, addressCity, addressState, addressZipCode]).join(', ');

        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('common.search')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <AddressSearch
                                    label={this.props.translate('addDebitCardPage.billingAddress')}
                                    containerStyles={[styles.mh5]}
                                    onChangeText={(fieldName, value) => this.clearErrorAndSetValue(fieldName, value)}
                                    value={fullAddress}
                                />
                            )}
                        </View>
                        <KeyboardSpacer />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

AddressSearchPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        address: {
            key: ONYXKEYS.SELECTED_ADDRESS,
        },
    }),
)(AddressSearchPage);
