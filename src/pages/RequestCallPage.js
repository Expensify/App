import * as React from 'react';
import {View, Text, TextInput} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import styles from '../styles/styles';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import NameEntryInputRow from '../components/NameEntryInputRow';

const propTypes = {
    ...withLocalizePropTypes,

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({
        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,


    }),
};
const defaultProps = {
    myPersonalDetails: {},
};

class RequestCallPage extends React.Component {
    constructor(props) {
        super(props);
        this.growlNotification = null;
        this.state = {
            firstName: props.myPersonalDetails.displayName.split(' ')[0] ?? '',
            lastName: props.myPersonalDetails.displayName.split(' ')[1] ?? '',
        };
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('requestCallPage.requestACall')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={styles.pageWrapper}>
                    <Text style={[styles.mb4, styles.textP, styles.w100]}>
                        {this.props.translate('requestCallPage.description')}
                    </Text>
                    <Text style={[styles.mt4, styles.mb4, styles.textP, styles.w100]}>
                        {this.props.translate('requestCallPage.instructions')}
                    </Text>
                    <NameEntryInputRow
                        firstName={this.state.firstName}
                        lastName={this.state.lastName}
                        onChangeFirstName={firstName => this.setState({firstName})}
                        onChangeLastName={lastName => this.setState({lastName})}
                        style={[styles.mt4, styles.mb4]}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

RequestCallPage.displayName = 'RequestCallPage';
RequestCallPage.propTypes = propTypes;
RequestCallPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(RequestCallPage);
