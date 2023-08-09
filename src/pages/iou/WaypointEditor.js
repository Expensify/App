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
import * as FormActions from '../../libs/actions/FormActions';


const propTypes = {
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
};

function WaypointEditor(props) {
    const waypointIndex = lodashGet(props.route.params, 'waypointIndex', '');
    const transactionID = lodashGet(props.route.params, 'transactionID', 0);

    const selectWaypoint = (details) => {

    }

    const validate = (values) => {
        const errors = {};

        const waypointValue = values[`waypoint${waypointIndex}`];
        if (!waypointValue || !ValidationUtils.isValidAddress(waypointValue)) {
            errors[`waypoint${waypointIndex}`] = 'distance.errors.invalidAddress';
        }

        // We only want you to be able to select an address from the dropdown
        // When an address is selected, we set a bunch of other values in the form
        // We're going to use those to determine whether an address has been selected or not
        if (!values.street && !values.city && !values.state && !values.zipCode) {
            errors[`waypoint${waypointIndex}`] = 'distance.errors.invalidAddress';
        }


        return errors;
    }

    const onSubmit = (values) => {
        console.log('what are my values');

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
                formID={ONYXKEYS.FORMS.WAYPOINT_FORM}
                enabledWhenOffline
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText=''
                isSubmitButtonVisible={false}
            >
                <View>
                    <AddressSearch
                        inputID={`waypoint${waypointIndex}`}
                        containerStyles={[styles.mt4]}
                        label="Address"
                        onPress={onSubmit}
                        shouldSaveDraft
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        renamedInputKeys={{
                            address: `waypoint${waypointIndex}`,
                            city: null,
                            country: null,
                            street: null,
                            street2: null,
                            zipCode: null,
                            lat: null,
                            lng: null,
                            state: null,
                        }}
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

    }),
)(WaypointEditor);
