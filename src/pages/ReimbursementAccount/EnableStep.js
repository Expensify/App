import React from 'react';
import {Image, View} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {navigateToConciergeChat} from '../../libs/actions/Report';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import compose from '../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
};

const EnableStep = ({translate}) => {
    const verifyingUrl = `${CONST.CLOUDFRONT_URL}/images/icons/emptystates/emptystate_reviewing.gif`;
    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
            <HeaderWithCloseButton
                title={translate('validationStep.headerTitle')}
                onCloseButtonPress={Navigation.dismissModal}
            />
            <View style={[styles.flex1]}>
                <Image
                    source={{uri: verifyingUrl}}
                    style={[styles.workspaceInviteWelcome]}
                    resizeMode="center"
                />
                <Text style={[styles.mh5, styles.mb5]}>
                    {translate('validationStep.reviewingInfo')}
                    <TextLink
                        onPress={() => {
                            // There are two modals that must be dismissed before we can reveal the Concierge
                            // chat underneath these screens
                            Navigation.dismissModal();
                            Navigation.dismissModal();
                            navigateToConciergeChat();
                        }}
                    >
                        {translate('common.here')}
                    </TextLink>
                    {translate('validationStep.forNextSteps')}
                </Text>
            </View>
        </View>
    );
};

EnableStep.propTypes = propTypes;
EnableStep.displayName = 'EnableStep';

export default compose(
    withLocalize,
)(EnableStep);
