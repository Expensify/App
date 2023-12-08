import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** All of the personal details for everyone */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** The report currently being looked at */
    report: reportPropTypes,
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** reportID and accountID passed via route: /r/:reportID/notes */
            reportID: PropTypes.string,
            accountID: PropTypes.string,
        }),
    }).isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    },
    personalDetailsList: {},
};

function PrivateNotesViewPage({route, personalDetailsList, session, report}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isCurrentUserNote = Number(session.accountID) === Number(route.params.accountID);
    const privateNote = lodashGet(report, ['privateNotes', route.params.accountID, 'note'], '');

    const getFallbackRoute = () => {
        const privateNotes = lodashGet(report, 'privateNotes', {});

        if (_.keys(privateNotes).length === 1) {
            return ROUTES.HOME;
        }

        return ROUTES.PRIVATE_NOTES_LIST.getRoute(report.reportID);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesViewPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                onBackButtonPress={() => Navigation.goBack(getFallbackRoute())}
                subtitle={isCurrentUserNote ? translate('privateNotes.myNote') : `${lodashGet(personalDetailsList, [route.params.accountID, 'login'], '')} note`}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <ScrollView style={[styles.flexGrow1]}>
                <OfflineWithFeedback pendingAction={lodashGet(report, ['privateNotes', route.params.accountID, 'pendingAction'], null)}>
                    <MenuItemWithTopDescription
                        description={translate('privateNotes.composerLabel')}
                        title={privateNote}
                        onPress={() => isCurrentUserNote && Navigation.navigate(ROUTES.PRIVATE_NOTES_EDIT.getRoute(report.reportID, route.params.accountID))}
                        shouldShowRightIcon={isCurrentUserNote}
                        numberOfLinesTitle={0}
                        shouldRenderAsHTML
                        brickRoadIndicator={!_.isEmpty(lodashGet(report, ['privateNotes', route.params.accountID, 'errors'], '')) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        disabled={!isCurrentUserNote}
                        shouldGreyOutWhenDisabled={false}
                    />
                </OfflineWithFeedback>
            </ScrollView>
        </ScreenWrapper>
    );
}

PrivateNotesViewPage.displayName = 'PrivateNotesViewPage';
PrivateNotesViewPage.propTypes = propTypes;
PrivateNotesViewPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportAndPrivateNotesOrNotFound,
    withOnyx({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(PrivateNotesViewPage);
