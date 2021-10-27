import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
} from '../libs/actions/PersonalDetails';
import currentUserPersonalDetailsPropsTypes from './settings/Profile/currentUserPersonalDetailsPropsTypes';
import compose from '../libs/compose';
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
            isAvatarUploading: false,

            // avatar: '',
            firstName: '',
            lastName: '',

            // secondaryLogin: '',
            errors: {
            //     avatar: false,
                firstName: false,
                lastName: false,

            //     secondaryLogin: false,
            },
        };
    }

    render() {
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                        <HeaderWithCloseButton title={this.props.translate('welcomeScreen.title')} />

                        <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>

                            <Text>
                                {this.props.translate('welcomeScreen.subtitle')}
                            </Text>

                            <View style={[styles.m5]}>
                                <AvatarWithImagePicker
                                    isUploading={this.state.isAvatarUploading}
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
                                    hasError={this.state.errors.firstName}
                                />
                            </View>
                            <View style={[styles.mb5]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.lastName')}
                                    value={this.state.lastName}
                                    hasError={this.state.errors.lastName}
                                />
                            </View>
                            <View style={[styles.mb5]}>
                                <ExpensiTextInput value={this.state.firstName} />
                            </View>

                        </ScrollView>
                        <FixedFooter>
                            <Button
                                success
                                style={[styles.w100]}
                                text={this.props.translate('welcomeScreen.getStarted')}
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
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WelcomePage);
