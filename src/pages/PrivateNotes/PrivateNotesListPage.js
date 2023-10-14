import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {ScrollView} from 'react-native';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import MenuItem from '../../components/MenuItem';
import useLocalize from '../../hooks/useLocalize';
import personalDetailsPropType from '../personalDetailsPropType';
import * as UserUtils from '../../libs/UserUtils';
import reportPropTypes from '../reportPropTypes';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import {withNetwork} from '../../components/OnyxProvider';
import ROUTES from '../../ROUTES';
import withReportAndPrivateNotesOrNotFound from '../home/report/withReportAndPrivateNotesOrNotFound';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    },
    personalDetailsList: {},
};

function PrivateNotesListPage({report, personalDetailsList, session}) {
    const {translate} = useLocalize();

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
                action: () => Navigation.navigate(ROUTES.PRIVATE_NOTES_VIEW.getRoute(report.reportID, accountID)),
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
            }))
            .value();
    }, [report, personalDetailsList, session, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesListPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>{_.map(privateNotes, (item, index) => getMenuItem(item, index))}</ScrollView>
        </ScreenWrapper>
    );
}

PrivateNotesListPage.propTypes = propTypes;
PrivateNotesListPage.defaultProps = defaultProps;
PrivateNotesListPage.displayName = 'PrivateNotesListPage';

export default compose(
    withLocalize,
    withReportAndPrivateNotesOrNotFound,
    withOnyx({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    withNetwork(),
)(PrivateNotesListPage);
