import _ from 'underscore';
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

        this.state = {
            addressStreet: '',
            addressState: '',
            addressCity: '',
            addressZipCode: '',
            errors: {},
        };

        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
     clearErrorAndSetValue(inputKey, value) {
        this.setState(prevState => ({
            [inputKey]: value,
            errors: {
                ...prevState.errors,
                [inputKey]: false,
            },
        }));
    }

    render() {
        console.log(this.state)
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
                                    value={this.state.addressStreet}
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
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(AddressSearchPage);
