import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {
    View,
    TextInput,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Str from 'expensify-common/lib/str';
import moment from 'moment-timezone';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import {setPersonalDetails} from '../../libs/actions/PersonalDetails';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Avatar from '../../components/Avatar';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {DownArrow} from '../../components/Icon/Expensicons';
import Icon from '../../components/Icon';
import Checkbox from '../../components/Checkbox';
import ButtonWithLoader from '../../components/ButtonWithLoader';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Email/Phone login of the current user from their personal details
        login: PropTypes.string,

        // Display first name of the current user from their personal details
        firstName: PropTypes.string,

        // Display last name of the current user from their personal details
        lastName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatarURL: PropTypes.string,

        // Pronouns of the current user from their personal details
        pronouns: PropTypes.string,

        // timezone of the current user from their personal details
        timezone: PropTypes.shape({

            // Value of selected timezone
            selected: PropTypes.string,

            // Whether timezone is automatically set
            automatic: PropTypes.bool,
        }),
    }),
};

const defaultProps = {
    myPersonalDetails: {},
};

const pronounsMap = {
    theyThemTheirs: 'They/them/theirs',
    sheHerHers: 'She/her/hers',
    heHimHis: 'He/him/his',
    zeHirHirs: 'Ze/hir/hirs',
    selfSelect: 'Self-select',
    callMeByMyName: 'Call me by my name',
};

const timezones = moment.tz.names()
    .map(timezone => ({
        value: timezone,
        label: timezone,
    }));

class ProfilePage extends Component {
    constructor(props) {
        super(props);

        const {
            firstName, lastName, pronouns, timezone = {},
        } = props.myPersonalDetails;

        this.state = {
            firstName,
            lastName,
            pronouns,
            selfSelectedPronouns: '',
            selectedTimezone: timezone.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
            isAutomaticTimezone: timezone.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
        };

        this.pronounDropdownValues = Object.values(pronounsMap).map(pronoun => ({value: pronoun, label: pronoun}));
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
    }

    updatePersonalDetails() {
        const {
            firstName, lastName, pronouns, selfSelectedPronouns, selectedTimezone, isAutomaticTimezone,
        } = this.state;

        setPersonalDetails({
            firstName,
            lastName,
            pronouns: pronouns === pronounsMap.selfSelect ? selfSelectedPronouns : pronouns,
            timezone: {
                automatic: isAutomaticTimezone,
                selected: selectedTimezone,
            },
        });
    }

    render() {
        return (
            <ScreenWrapper>
                {() => (
                    <>
                        <HeaderWithCloseButton
                            title="Profile"
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                            onCloseButtonPress={Navigation.dismissModal}
                        />
                        <View style={styles.p5}>
                            <Avatar
                                style={[styles.avatarLarge, styles.alignSelfCenter]}
                                source={this.props.myPersonalDetails.avatarURL}
                            />
                            <Text fontSize={17} style={[styles.mt6, styles.mb6]}>
                                Tell us about yourself, we would love to get to know you!
                            </Text>
                            <View style={[styles.flexRow, styles.mb6]}>
                                <View style={styles.flex1}>
                                    <Text style={styles.mb1}>First Name</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={this.state.firstName}
                                        onChangeText={firstName => this.setState({firstName})}
                                        placeholder="John"
                                    />
                                </View>
                                <View style={[styles.flex1, styles.ml2]}>
                                    <Text style={styles.mb1}>Last Name</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={this.state.lastName}
                                        onChangeText={lastName => this.setState({lastName})}
                                        placeholder="Doe"
                                    />
                                </View>
                            </View>
                            <View style={styles.mb6}>
                                <Text style={styles.mb1}>Preferred Pronouns</Text>
                                <View style={styles.mb1}>
                                    <RNPickerSelect
                                        onValueChange={pronouns => this.setState({pronouns, selfSelectedPronouns: ''})}
                                        items={this.pronounDropdownValues}
                                        style={styles.picker}
                                        useNativeAndroidPickerStyle={false}
                                        placeholder={{
                                            value: '',
                                            label: 'Select your pronouns',
                                        }}
                                        value={this.state.pronouns}
                                        Icon={() => <Icon src={DownArrow} />}
                                    />
                                </View>
                                {this.state.pronouns === pronounsMap.selfSelect ? (
                                    <TextInput
                                        style={styles.textInput}
                                        value={this.state.selfSelectedPronouns}
                                        onChangeText={selfSelectedPronouns => this.setState({selfSelectedPronouns})}
                                        placeholder="Self-select your pronoun"
                                    />
                                ) : null}
                            </View>
                            <View style={styles.mb6}>
                                <Text style={styles.mb1}>
                                    {Str.isSMSLogin(this.props.myPersonalDetails.login)
                                        ? 'Phone Number' : 'Email Address'}
                                </Text>
                                <TextInput
                                    style={[styles.textInput, styles.disabledTextInput]}
                                    value={this.props.myPersonalDetails.login}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.mb2}>
                                <Text style={styles.mb1}>Timezone</Text>
                                <RNPickerSelect
                                    onValueChange={selectedTimezone => this.setState({selectedTimezone})}
                                    items={timezones}
                                    style={this.state.isAutomaticTimezone ? {
                                        ...styles.picker,
                                        inputIOS: [styles.picker.inputIOS, styles.textInput, styles.disabledTextInput],
                                        inputAndroid: [
                                            styles.picker.inputAndroid, styles.textInput, styles.disabledTextInput,
                                        ],
                                        inputWeb: [styles.picker.inputWeb, styles.textInput, styles.disabledTextInput],
                                    } : styles.picker}
                                    useNativeAndroidPickerStyle={false}
                                    value={this.state.selectedTimezone}
                                    Icon={() => <Icon src={DownArrow} />}
                                    disabled={this.state.isAutomaticTimezone}
                                />
                            </View>
                            <Checkbox
                                label="Set my timezone automatically"
                                isChecked={this.state.isAutomaticTimezone}
                                onClick={isAutomaticTimezone => this.setState({isAutomaticTimezone})}
                            />
                        </View>
                        <View style={styles.fixedBottomButton}>
                            <ButtonWithLoader
                                text="Save"
                                onClick={this.updatePersonalDetails}
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}


ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default withOnyx({
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
})(ProfilePage);
