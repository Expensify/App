import React from 'react';
import {View, TextInput} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
};

class ValidationStep extends React.Component {
    render() {
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Validation Step"
                    onCloseButtonPress={Navigation.dismissModal}
                />
            </View>
        );
    }
}

export default withLocalize(ValidationStep);
