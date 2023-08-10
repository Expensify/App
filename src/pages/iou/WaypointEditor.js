import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import AddressSearch from '../../components/AddressSearch';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import DistanceRequest from '../../libs/actions/DistanceRequest';
import ROUTES from '../../ROUTES';


const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            waypointIndex: PropTypes.string,
            transactionID: PropTypes.string,
        }),
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {
            waypointIndex: '',
            transactionID: '',
        },
    },
};

function WaypointEditor(props) {
    const waypointIndex = lodashGet(props.route.params, 'waypointIndex', '');
    const transactionID = lodashGet(props.route.params, 'transactionID', '');


    const validate = (values) => {
        const errors = {};

        // The address can only be empty (removes the value), or auto-selected which goes through the onPress method
        // This basically only allows empty values to be saved
        if (values[`waypoint${waypointIndex}`]) {
            errors[`waypoint${waypointIndex}`] = 'distance.errors.invalidAddress';
        }

        return errors;
    }

    const onSubmit = (values) => {    
        // Allows letting you set a waypoint to an empty value
        if (!values[`waypoint${waypointIndex}`]) {
            DistanceRequest.saveWaypoint(transactionID, waypointIndex, null);
        } else {
            return;
        }

        Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute('request'));
    }

    const onPress = (values) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
        }

        DistanceRequest.saveWaypoint(transactionID, waypointIndex, waypoint);
        Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute('request'));
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
                        shouldSaveDraft
                        onPress={onPress}
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
