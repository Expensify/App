import React from 'react';
import {View} from 'react-native';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';


const propTypes = {
    ...withLocalizePropTypes,
};

class WelcomePage extends React.Component {
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
                    <HeaderWithCloseButton title={this.props.translate('welcomeScreen.title')} />
                </View>
            </>
        );
    }
}

WelcomePage.propTypes = propTypes;

export default withLocalize(WelcomePage);
