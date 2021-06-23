import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import {Text, View} from 'react-native';
import lodashGet from 'lodash/get';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import MultipleAvatars from '../components/MultipleAvatars';
import DisplayNames from '../components/DisplayNames';
import {getPersonalDetailsForLogins} from '../libs/OptionsListUtils';
import {isDefaultRoom} from '../libs/reportUtils';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Name of the report */
        reportName: PropTypes.string,

        /** List of primarylogins of participants of the report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** ID of the report */
        reportID: PropTypes.number,
    }).isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/details */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

class ReportDetailsPage extends Component {
    constructor(props) {
        console.log('>>>>');
        super(props);
    }

    render() {
        const policyID = lodashGet(this.props.report, 'policyID', '');
        const policyName = lodashGet(this.props.policies, [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, 'name'], 'Unknown Policy');
        const participants = lodashGet(this.props.report, 'participants', []);
        const isMultipleParticipant = participants.length > 1;
        const displayNamesWithTooltips = _.map(
            getPersonalDetailsForLogins(participants, this.props.personalDetails),
            ({displayName, firstName, login}) => {
                const displayNameTrimmed = Str.isSMSLogin(login) ? this.props.toLocalPhone(displayName) : displayName;

                return {
                    displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                    tooltip: Str.removeSMSDomain(login),
                };
            },
        );
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <View style={[styles.dFlex, styles.flexColumn, styles.alignItemsCenter]}>
                        <MultipleAvatars
                            avatarImageURLs={this.props.report.icons}
                            secondAvatarStyle={[styles.secondAvatarHovered]}
                        />
                        <View style={[styles.flex1, styles.flexColumn]}>
                            <DisplayNames
                                fullTitle={this.props.report.reportName}
                                displayNamesWithTooltips={displayNamesWithTooltips}
                                tooltipEnabled
                                numberOfLines={1}
                                textStyles={[styles.headerText]}
                                shouldUseFullTitle={isDefaultRoom(this.props.report)}
                            />
                            <Text
                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.mt1]}
                                numberOfLines={1}
                            >
                                {policyName}
                            </Text>
                        </View>
                    </View>
                </View>


            </ScreenWrapper>
        )
    }
}

ReportDetailsPage.displayName = 'ReportDetailsPage';
ReportDetailsPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
)(ReportDetailsPage);
