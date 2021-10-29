import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';
import ScreenWrapper from '../components/ScreenWrapper';
import ExpensiTextInput from '../components/ExpensiTextInput';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import FixedFooter from '../components/FixedFooter';
import Button from '../components/Button';
import styles from '../styles/styles';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import AvatarWithImagePicker from '../components/AvatarWithImagePicker';
import {
    setAvatar,
    deleteAvatar,
    getFirstAndLastNameErrors,
    setPersonalDetails,
} from '../libs/actions/PersonalDetails';
import currentUserPersonalDetailsPropsTypes from './settings/Profile/currentUserPersonalDetailsPropsTypes';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';


const propTypes = {

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
};


class WelcomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            errors: {
                firstName: '',
                lastName: '',
            },
        };

        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate() {
        const {firstNameError, lastNameError} = getFirstAndLastNameErrors(this.state.firstName, this.state.lastName);

        const errors = this.state.errors;
        errors.firstName = firstNameError;
        errors.lastName = lastNameError;

        return _.isEmpty(firstNameError) && _.isEmpty(lastNameError);
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        const {firstName, lastName} = this.state;

        setPersonalDetails({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        }, true, true);
    }

    render() {
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                        <HeaderWithCloseButton
                            title={this.props.translate('welcomeScreen.title')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />

                        <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>

                            <Text>
                                {this.props.translate('welcomeScreen.subtitle')}
                            </Text>

                            <View style={[styles.m5]}>
                                <AvatarWithImagePicker
                                    isUploading={this.props.myPersonalDetails.avatarUploading}
                                    avatarURL={this.props.myPersonalDetails.avatar}
                                    onImageSelected={setAvatar}
                                    onImageRemoved={() => deleteAvatar(this.props.myPersonalDetails.login)}
                            // eslint-disable-next-line max-len
                                    isUsingDefaultAvatar={this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                                    anchorPosition={styles.createMenuPositionProfile}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                />
                            </View>

                            <View style={[styles.mb5]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.firstName')}
                                    value={this.state.firstName}
                                    onChangeText={firstName => this.setState({firstName})}
                                    hasError={Boolean(this.state.errors.firstName)}
                                    errorText={this.state.errors.firstName}
                                />
                            </View>
                            <View style={[styles.mb5]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.lastName')}
                                    value={this.state.lastName}
                                    onChangeText={lastName => this.setState({lastName})}
                                    hasError={Boolean(this.state.errors.lastName)}
                                    errorText={this.state.errors.lastName}
                                />
                            </View>
                        </ScrollView>
                        <FixedFooter>
                            <Button
                                success
                                style={[styles.w100]}
                                text={this.props.translate('welcomeScreen.getStarted')}
                                onPress={this.submit}
                            />
                        </FixedFooter>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        );
    }
}

WelcomePage.propTypes = propTypes;
WelcomePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
    }),
)(WelcomePage);
