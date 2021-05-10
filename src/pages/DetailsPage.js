import React from 'react';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import styles from '../styles/styles';
import Text from '../components/Text';
import ONYXKEYS from '../ONYXKEYS';
import Avatar from '../components/Avatar';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import personalDetailsPropType from './personalDetailsPropType';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // login passed via route /details/:login
        login: PropTypes.string,

        // report ID passed
        reportID: PropTypes.string,
    }),
});

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    personalDetails: personalDetailsPropType.isRequired,

    // Route params
    route: matchType.isRequired,
};

const DetailsPage = ({personalDetails, route}) => {
    const details = personalDetails[route.params.login];

    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    const shouldShowBackButton = Boolean(route.params.reportID);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title="Details"
                shouldShowBackButton={shouldShowBackButton}
                onBackButtonPress={Navigation.goBack}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.containerWithSpaceBetween,
                ]}
            >
                {details ? (
                    <View>
                        <View style={styles.pageWrapper}>
                            <View
                                style={[styles.avatarLarge, styles.mb3]}
                            >
                                <Avatar
                                    style={[styles.avatarLarge]}
                                    source={details.avatar}
                                />
                            </View>
                            <Text style={[styles.displayName, styles.mt1, styles.mb6]} numberOfLines={1}>
                                {details.displayName
                                    ? details.displayName
                                    : null}
                            </Text>
                            {details.login ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        {Str.isSMSLogin(details.login) ? 'Phone Number' : 'Email'}
                                    </Text>
                                    <Text style={[styles.textP]} numberOfLines={1}>
                                        {Str.isSMSLogin(details.login)
                                            ? Str.removeSMSDomain(details.login)
                                            : details.login}
                                    </Text>
                                </View>
                            ) : null}
                            {details.pronouns ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        Preferred Pronouns
                                    </Text>
                                    <Text style={[styles.textP]} numberOfLines={1}>
                                        {details.pronouns}
                                    </Text>
                                </View>
                            ) : null}
                            {details.timezone ? (
                                <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                                    <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                                        Local Time
                                    </Text>
                                    <Text style={[styles.textP]} numberOfLines={1}>
                                        {moment().tz(details.timezone.selected).format('LT')}
                                        {' '}
                                        {isNaN(moment().tz(details.timezone.selected).zoneAbbr()) ? ( 
                                            <Text>{moment().tz(details.timezone.selected).zoneAbbr()}</Text>
                                        ) : (
                                            <Text>
                                                {moment.tz(details.timezone.selected).toString().split("-")[0].slice(-3)}
                                                {' '}
                                                {moment().tz(details.timezone.selected).zoneAbbr()}
                                            </Text>
                                        )}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
            </View>
        </ScreenWrapper>
    );
};

DetailsPage.propTypes = propTypes;
DetailsPage.displayName = 'DetailsPage';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(DetailsPage);
