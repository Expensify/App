import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {
    View,
    TextInput,
    ScrollView,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment-timezone';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import {setPersonalDetails, setAvatar, deleteAvatar} from '../../../libs/actions/PersonalDetails';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
// import currentUserPersonalDetailsPropsTypes from './currentUserPersonalDetailsPropsTypes';

const propTypes = {
    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
};


class DebitCardPage extends Component {
    // constructor(props) {
    // }

    componentDidUpdate(prevProps) {
    }


    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('addDebitCardPage.addADebitCard')}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                      <View/>
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            isDisabled={false}
                            onPress={() => console.log('onPress')}
                            style={[styles.w100]}
                            text={this.props.translate('common.save')}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;
DebitCardPage.displayName = 'DebitCardPage';

export default compose(
    withLocalize,
    withOnyx({
    }),
)(DebitCardPage);
