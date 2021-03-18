import React from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';

class AdditionalDetailsStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Additional Details"
                />
                <View style={[styles.p5]}>
                    <Text
                        style={[styles.mb2]}
                    >
                        We need to confirm the following information before we can process this payment.
                    </Text>
                    <TouchableOpacity
                        style={[styles.mb2]}
                        onPress={() => {
                            // Open link to help doc
                        }}
                    >
                        <Text style={[styles.link]}>Learn more about why we need this.</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={[styles.p5]}>
                    <Text>Legal First Name</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Legal Middle Name</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Legal Last Name</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Address (no P.O. boxes)</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>City</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>State</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Zip Code</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Phone Number</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Date of Birth</Text>
                    <TextInput style={[styles.textInput]} />

                    <Text>Social Security Number</Text>
                    <TextInput style={[styles.textInput]} />
                </ScrollView>
                <View style={[styles.p5, styles.flex1, styles.justifyContentEnd]}>
                    <Button
                        title="Save & Continue"
                        onPress={() => {
                            // For now, these details are just getting hardcoded in so we can
                            // check the results. This should be hooked up to the form eventually.
                            this.props.onSubmit({
                                legalFirstName: 'Marc',
                                legalMiddleName: 'Aaron',
                                legalLastName: 'Derpenstein',
                                dob: '1999-01-01',
                                addressStreet: '1234 Sesame Street',
                                addressCity: 'Topeka',
                                addressState: 'KS',
                                addressZip: '12345',
                                phoneNumber: '+15555555555',
                                ssn: '123456789',
                            });
                        }}
                    />
                </View>
            </View>
        );
    }
}

export default AdditionalDetailsStep;
