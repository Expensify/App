import React, {Component} from 'react';
import {ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import ExpensiTextInput from '../../../components/ExpensiTextInput';
import ExpensifyText from '../../../components/ExpensifyText';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
};

class CloseAccountPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reasonForLeaving: 'a',
            phoneOrEmail: 'b',
        };
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('closeAccountPage.closeAccount')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView
                        contentContainerStyle={[
                            styles.flexGrow1,
                            styles.flexColumn,
                            styles.p5,
                        ]}
                    >
                        <ExpensifyText>{this.props.translate('closeAccountPage.reasonForLeavingPrompt')}</ExpensifyText>
                        <ExpensiTextInput
                            value={this.state.reasonForLeaving}
                            label={this.props.translate('closeAccountPage.typeMessageHere')}
                            containerStyles={[styles.mt5]}
                        />
                        <ExpensifyText style={[styles.mt5]}>
                            {this.props.translate('closeAccountPage.closeAccountWarning')}
                        </ExpensifyText>
                        <ExpensiTextInput
                            value={this.state.phoneOrEmail}
                            label={this.props.translate('loginForm.phoneOrEmail')}
                            containerStyles={[styles.mt5]}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.displayName = 'CloseAccountPage';

export default withLocalize(CloseAccountPage);
