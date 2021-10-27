import React from 'react';
import {View} from 'react-native';

import HeaderWithCloseButton from '../components/HeaderWithCloseButton';

class WelcomeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            avatar: '',
            firstName: '',
            lastName: '',
            secondaryLogin: '',
            errors: {
            	avatar: false,
            	firstName: false,
            	lastName: false,
            	secondaryLogin: false,

            },
        };
    }

    render() {
        return (
            <>
                <View>
                    <HeaderWithCloseButton />
                </View>
            </>
        );
    }
}

export default WelcomeScreen;
