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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';


const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        transactionID: PropTypes.string,
        comment: PropTypes.shape({
            waypoints: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
                address: PropTypes.string,
            }),
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    transactionID: '',
    transaction: {},
};

function WaypointEditor(props) {

    function selectWaypoint(details) {
        console.log('What are details', details);
        const lat = details.geometry.location.lat;
        const long = details.geometry.location.lng;
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
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                submitButtonText="send it lol"
                enabledWhenOffline
            >
                <View>
                    <AddressSearch
                        inputID="waypointEditor"
                        onValueChange={(details) => selectWaypoint(details)}
                        shouldSaveDraft
                        containerStyles={[styles.mt4]}
                        label="Address"
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
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
        transaction: {
            key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
            selector: (transaction) => (transaction ? {transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}} : null),
        },
    }),
)(WaypointEditor);