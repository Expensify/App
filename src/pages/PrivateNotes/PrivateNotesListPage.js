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
import useLocalize from '../../hooks/useLocalize';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import * as Report from '../../libs/actions/Report';
import personalDetailsPropType from '../personalDetailsPropType';
import * as UserUtils from '../../libs/UserUtils';
import reportPropTypes from '../reportPropTypes';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import ROUTES from '../../ROUTES';

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
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    /** All of the personal details for everyone */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** Information about the network */
    network: networkPropTypes.isRequired,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    },
    personalDetailsList: {},
};

function PrivateNotesListPage({report, personalDetailsList, network, session}) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (network.isOffline) {
            return;
        }
        Report.getReportPrivateNote(report.reportID);
    }, [report.reportID, network.isOffline]);

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
     * Returns a list of private notes on the given chat report
     * @returns {Array} the menu item list
     */
    const privateNotes = useMemo(() => {
        const privateNoteBrickRoadIndicator = (accountID) => (!_.isEmpty(lodashGet(report, ['privateNotes', accountID, 'errors'], '')) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '');
        return _.chain(lodashGet(report, 'privateNotes', {}))
            .map((privateNote, accountID) => ({
                title: Number(lodashGet(session, 'accountID', null)) === Number(accountID) ? translate('privateNotes.myNote') : lodashGet(personalDetailsList, [accountID, 'login'], ''),
                icon: UserUtils.getAvatar(lodashGet(personalDetailsList, [accountID, 'avatar'], UserUtils.getDefaultAvatar(accountID)), accountID),
                iconType: CONST.ICON_TYPE_AVATAR,
                action: () => Navigation.navigate(ROUTES.getPrivateNotesViewRoute(report.reportID, accountID)),
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
            }))
            .value();
    }, [report, personalDetailsList, session, translate]);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <FullPageNotFoundView shouldShow={_.isEmpty(report.reportID) || (!report.isLoadingPrivateNotes && network.isOffline && _.isEmpty(lodashGet(report, 'privateNotes', {})))}>
                <HeaderWithBackButton
                    title={translate('privateNotes.title')}
                    shouldShowBackButton
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                {report.isLoadingPrivateNotes && _.isEmpty(lodashGet(report, 'privateNotes', {})) ? (
                    <FullScreenLoadingIndicator />
                ) : (
                    _.map(privateNotes, (item, index) => getMenuItem(item, index))
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

PrivateNotesListPage.propTypes = propTypes;
PrivateNotesListPage.defaultProps = defaultProps;

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
    withNetwork(),
)(PrivateNotesListPage);
