import React from 'react';
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
import getFullAddress from '../libs/AddressUtils';

const propTypes = {
    /* Onyx Props */
    address: PropTypes.shape({
        addressStreet: PropTypes.string,
        addressCity: PropTypes.string,
        addressState: PropTypes.string,
        addressZipCode: PropTypes.string,
    }),

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /** Localize Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    address: {
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZipCode: '',
    },
};

const AddressSearchPage = props => (
    <ScreenWrapper>
        {({didScreenTransitionEnd}) => (
            <>
                <HeaderWithCloseButton
                    title={props.translate('common.search')}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                    {didScreenTransitionEnd && (
                        <AddressSearch
                            label={props.translate('common.address')}
                            containerStyles={[styles.mh5]}
                            value={getFullAddress(props.address)}
                        />
                    )}
                </View>
                <KeyboardSpacer />
            </>
        )}
    </ScreenWrapper>
);

AddressSearchPage.propTypes = propTypes;
AddressSearchPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        address: {
            key: ONYXKEYS.SELECTED_ADDRESS,
        },
    }),
)(AddressSearchPage);
