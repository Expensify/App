import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import HeaderWithCloseButton from "../../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import Text from '../../../../components/Text';
import withLocalize, {withLocalizePropTypes} from "../../../../components/withLocalize";
import Navigation from "../../../../libs/Navigation/Navigation";
import ROUTES from "../../../../ROUTES";
import styles from '../../../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const NewContactMethodPage = (props) => {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('contacts.newContactMethod')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView>
                <Text style={[styles.ph5, styles.mb5]}>
                    {props.translate('newContactMethodPage.description')}
                </Text>
            </ScrollView>
        </ScreenWrapper>
    );
}

NewContactMethodPage.displayName = 'NewContactMethodPage';
NewContactMethodPage.propTypes = propTypes;

export default withLocalize(NewContactMethodPage);
