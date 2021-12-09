import _ from 'underscore';
import React from 'react';
import {Text, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
};

const CloseAccountPage = (props) => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('closeAccountPage.closeAccount')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <ScrollView
            contentContainerStyle={[
                styles.flexGrow1,
                styles.flexColumn,
                styles.justifyContentBetween,
            ]}
        >
            <Text>___Close Account___</Text>
        </ScrollView>
    </ScreenWrapper>
);

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.displayName = 'CloseAccountPage';

export default withLocalize(CloseAccountPage);
