import React, { Component } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import HeaderWithCloseButton from "../../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from "../../../../components/withLocalize";
import Navigation from "../../../../libs/Navigation/Navigation";
import ROUTES from "../../../../ROUTES";
import styles from '../../../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

class NewContactMethodPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            login: '',
        };
        this.onLoginChange = this.onLoginChange.bind(this);
    }

    onLoginChange(login) {
        this.setState({login});
    }

    render() {
        return (
            <ScreenWrapper
            onTransitionEnd={() => {
                if (!this.loginInputRef) {
                    return;
                }
                this.loginInputRef.focus();
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('contacts.newContactMethod')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView>
                    <Text style={[styles.ph5, styles.mb5]}>
                        {this.props.translate('newContactMethodPage.description')}
                    </Text>
                    <View style={[styles.ph5, styles.mb6]}>
                        <TextInput
                            label={this.props.translate('newContactMethodPage.loginPlaceholder')}
                            ref={el => this.loginInputRef = el}
                            value={this.state.login}
                            onChangeText={this.onLoginChange}
                            returnKeyType="done"
                        />
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

NewContactMethodPage.displayName = 'NewContactMethodPage';
NewContactMethodPage.propTypes = propTypes;

export default withLocalize(NewContactMethodPage);
