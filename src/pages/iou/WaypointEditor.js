import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import AddressSearch from '../../components/AddressSearch';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import * as ValidationUtils from '../../libs/ValidationUtils';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';


const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,


    /** Form values */
    values: PropTypes.shape({
        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,
    }),
    

    formData: PropTypes.shape({}),

    ...withLocalizePropTypes,
};

const defaultProps = {
    values: {
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
    },
    transactionID: '',
    formData: {},
};

function WaypointEditor(props) {
    const waypointIndex = lodashGet(props.route.params, 'waypointIndex', '');
    console.log(props);
    const selectWaypoint = (details) => {
        console.log('What are details', details);
        const lat = details.geometry.location.lat;
        const long = details.geometry.location.lng;
    }

    const [address, setAddressValue] = React.useState('');

    const validate = (values) => {
        const errors = {};
        if (!values.addressStreet || !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'addDebitCardPage.error.addressStreet';
        }

        if (!values.addressZipCode || !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'addDebitCardPage.error.addressZipCode';
        }

        if (!values.addressState || !values.addressState) {
            errors.addressState = 'addDebitCardPage.error.addressState';
        }

        return errors;
    }

    const onSubmit = (params) => {
        console.log('What are params', params);
    }

    const onAddressUpdate = (value) => {
        console.log('value', value);
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Waypoint Editor"
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <Form
                style={[styles.flexGrow1, styles.mh5]}
                formID={`${ONYXKEYS.FORMS.WAYPOINT_FORM}`}
                enabledWhenOffline
                validate={validate}
                onSubmit={onSubmit}
                isSubmitButtonVisible={false}
            >
                <View>
                    <AddressSearch
                        inputID={`waypoint${waypointIndex}`}
                        containerStyles={[styles.mt4]}
                        label="Address"
                        shouldSaveDraft
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        onInputChange={(value) => console.log(value)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    )

}

WaypointEditor.displayName = 'WaypointEditor';
WaypointEditor.propTypes = propTypes;
WaypointEditor.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        formData: {
            key: ONYXKEYS.FORMS.WAYPOINT_FORM,
        },
    }),
)(WaypointEditor);