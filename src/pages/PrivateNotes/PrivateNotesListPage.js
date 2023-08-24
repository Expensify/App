import React, {useMemo, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import MenuItem from '../../components/MenuItem';
import * as ReportUtils from '../../libs/ReportUtils';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import * as Report from '../../libs/actions/Report';
import personalDetailsPropType from '../personalDetailsPropType';
import * as UserUtils from '../../libs/UserUtils';
import reportPropTypes from '../reportPropTypes';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';

const propTypes = {
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

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        accountID: PropTypes.number,
    }),

     /** All of the personal details for everyone */
     personalDetailsList: PropTypes.objectOf(personalDetailsPropType),
     ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    },
    personalDetailsList: {},
};

function PrivateNotesListPage({session, report, personalDetailsList}) {
    const {translate} = useLocalize();

    useEffect(() => {
        Report.getReportPrivateNote(report.reportID);
    }, [report.reportID]);

    useNetwork({onReconnect: () => Report.getReportPrivateNote(report.reportID)});
    /**
     * Gets the menu item for each workspace
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {JSX}
     */
    function getMenuItem(item, index) {
        const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;

        return (
            <OfflineWithFeedback
                key={`${keyTitle}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                onClose={item.dismissError}
                errors={item.errors}
            >
                <MenuItem
                    title={keyTitle}
                    icon={item.icon}
                    iconType={CONST.ICON_TYPE_WORKSPACE}
                    onPress={item.action}
                    shouldShowRightIcon
                    fallbackIcon={item.fallbackIcon}
                    brickRoadIndicator={item.brickRoadIndicator}
                />
            </OfflineWithFeedback>
        );
    }

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     * @returns {Array} the menu item list
     */
    const privateNotes = useMemo(() => {
        const privateNoteBrickRoadIndicator = (accountID) => !_.isEmpty(lodashGet(report, `privateNotes.${accountID}.errors`, '')) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        return _.chain(lodashGet(report, 'privateNotes'))
            .map(([accountID]) => ({
                title: lodashGet(personalDetailsList, `${accountID}.login`, ''),
                icon: UserUtils.getAvatar(lodashGet(personalDetailsList, `${accountID}.avatar`, UserUtils.getDefaultAvatar(accountID))),
                iconType: CONST.ICON_TYPE_AVATAR,
                action: () => ReportUtils.navigateToPrivateNotesPage(report, accountID),
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
            }))
            .value();
    }, [report.privateNotes]);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <FullPageNotFoundView
                shouldShow={(_.isEmpty(report.reportID) || !report.isLoadingPrivateNotes && _.isEmpty(lodashGet(report, 'privateNotes', [])))}
                onBackButtonPress={() => Navigation.goBack()}
            >
                <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
                onBackButtonPress={() => Navigation.goBack()}
                />
                {report.isLoading && <FullScreenLoadingIndicator/>}
                {!report.isLoading && _.map(privateNotes, (item, index) => getMenuItem(item, index))}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

PrivateNotesListPage.propTypes = propTypes;
PrivateNotesListPage.defaultProps = defaultProps;

export default compose(
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
    withLocalize,
)(PrivateNotesListPage);
