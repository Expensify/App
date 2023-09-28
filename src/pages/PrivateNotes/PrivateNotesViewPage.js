import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import withLocalize from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../reportPropTypes';
import personalDetailsPropType from '../personalDetailsPropType';
import useLocalize from '../../hooks/useLocalize';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import CONST from '../../CONST';
import * as ReportUtils from '../../libs/ReportUtils';

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
    const {translate} = useLocalize();
    const isCurrentUserNote = Number(session.accountID) === Number(route.params.accountID);
    const privateNote = lodashGet(report, ['privateNotes', route.params.accountID, 'note'], '');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesViewPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={_.isEmpty(report) || _.isEmpty(report.privateNotes) || !_.has(report, ['privateNotes', route.params.accountID, 'note']) || ReportUtils.isArchivedRoom(report)}
                subtitleKey="privateNotes.notesUnavailable"
            >
                <HeaderWithBackButton
                    title={translate('privateNotes.title')}
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

PrivateNotesViewPage.displayName = 'PrivateNotesViewPage';
PrivateNotesViewPage.propTypes = propTypes;
PrivateNotesViewPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID.toString()}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(PrivateNotesViewPage);
