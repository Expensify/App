import React from 'react';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
} from 'react-native';
import CheckBox from '../../components/CheckBox';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';

const LinkText = (props) => (
    <TouchableOpacity
        style={[styles.mb2]}
        onPress={() => {
            // Open link to help doc
            console.debug(props.url);
        }}
    >
        <Text style={[styles.link]}>{props.children}</Text>
    </TouchableOpacity>
);

class TermsStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasAgreedToRecieveElectronicDisclosures: false,
            hasAgreedToPrivacyPolicyAndWalletAgreement: false,
        };
    }

    render() {
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Terms and Fees"
                />
                <View style={[styles.p5]}>
                    <LinkText url="">
                        More information regarding fees
                    </LinkText>
                </View>
                <View style={[styles.p5]}>
                    <View style={[styles.flexRow]}>
                        <CheckBox
                            value={this.state.hasAgreedToRecieveElectronicDisclosures}
                            onValueChange={hasAgreedToRecieveElectronicDisclosures => (
                                this.setState({hasAgreedToRecieveElectronicDisclosures})
                            )}
                        />
                        <Text>
                            I have read and agree to recieve
                            {' '}
                            <LinkText url="">electronic disclosures.</LinkText>
                        </Text>
                    </View>
                    <View style={[styles.flexRow]}>
                        <CheckBox
                            value={this.state.hasAgreedToPrivacyPolicyAndWalletAgreement}
                            onValueChange={hasAgreedToPrivacyPolicyAndWalletAgreement => (
                                this.setState({hasAgreedToPrivacyPolicyAndWalletAgreement})
                            )}
                        />
                        <Text>
                            I agree to the
                            {' '}
                            <LinkText url="">
                                Privacy Policy
                            </LinkText>
                            {' '}
                            and
                            {' '}
                            <LinkText url="">
                                Wallet Agreement.
                            </LinkText>
                        </Text>
                    </View>
                </View>
                <View style={[styles.p5, styles.flex1, styles.justifyContentEnd]}>
                    <Button
                        title="Enable Payments"
                        onPress={() => {
                            this.props.onSubmit({
                                hasAcceptedTerms: this.state.hasAgreedToRecieveElectronicDisclosures
                                    && this.state.hasAgreedToPrivacyPolicyAndWalletAgreement,
                            });
                        }}
                    />
                </View>
            </View>
        );
    }
}

export default TermsStep;
