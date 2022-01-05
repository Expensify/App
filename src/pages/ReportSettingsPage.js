import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize from '../components/withLocalize';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

    /** The active report */
    report: PropTypes.shape({
        /** The list of icons */
        icons: PropTypes.arrayOf(PropTypes.string),

        /** The report name */
        reportName: PropTypes.string,
    }).isRequired,
};


const ReportSettingsPage = (props) => {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={this.props.translate('common.settings')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => NavigationContainer.dismissModal(true)}
            />
        </ScreenWrapper>
    );
}

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.displayName = 'ReportSettingsPage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(ReportSettingsPage);