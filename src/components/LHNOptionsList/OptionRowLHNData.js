import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useMemo} from 'react';
import {deepEqual} from 'fast-equals';
import {withReportCommentDrafts} from '../OnyxProvider';
import SidebarUtils from '../../libs/SidebarUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../withCurrentReportID';
import OptionRowLHN, {propTypes as basePropTypes, defaultProps as baseDefaultProps} from './OptionRowLHN';
import * as Report from '../../libs/actions/Report';
import * as UserUtils from '../../libs/UserUtils';
import participantPropTypes from '../participantPropTypes';
import CONST from '../../CONST';

const propTypes = {
    /** If true will disable ever setting the OptionRowLHN to focused */
    shouldDisableFocusOptions: PropTypes.bool,

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The preferred language for the app */
    preferredLocale: PropTypes.string,

    /** The full data of the report */
    // eslint-disable-next-line react/forbid-prop-types
    fullReport: PropTypes.object,

    ...withCurrentReportIDPropTypes,
    ...basePropTypes,
};

const defaultProps = {
    shouldDisableFocusOptions: false,
    personalDetails: {},
    fullReport: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
    ...withCurrentReportIDDefaultProps,
    ...baseDefaultProps,
};

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData(props) {
    // We only want to pass a boolean to the memoized component,
    // instead of a changing number (so we prevent unnecessary re-renders).
    const isFocused = !props.shouldDisableFocusOptions && props.currentReportId === props.reportID;

    const optionItemRef = useRef();
    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData(props.fullReport, props.personalDetails, props.preferredLocale);
        if (deepEqual(item, optionItemRef.current)) {
            return optionItemRef.current;
        }
        optionItemRef.current = item;
        return item;
    }, [props.fullReport, props.preferredLocale, props.personalDetails]);

    useEffect(() => {
        if (!optionItem || optionItem.hasDraftComment || !props.comment || props.comment.length <= 0 || isFocused) {
            return;
        }
        Report.setReportWithDraft(props.reportID, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, 'currentReportID', 'comment', 'personalDetails', 'preferredLocale', 'fullReport')}
            isFocused={isFocused}
            optionItem={optionItem}
        />
    );
}

OptionRowLHNData.propTypes = propTypes;
OptionRowLHNData.defaultProps = defaultProps;
OptionRowLHNData.displayName = 'OptionRowLHNData';

/**
 * @param {Object} [personalDetails]
 * @returns {Object|undefined}
 */
const personalDetailsSelector = (personalDetails) =>
    _.reduce(
        personalDetails,
        (finalPersonalDetails, personalData, accountID) => {
            // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
            // eslint-disable-next-line no-param-reassign
            finalPersonalDetails[accountID] = {
                accountID: Number(accountID),
                login: personalData.login,
                displayName: personalData.displayName,
                firstName: personalData.firstName,
                avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
            };
            return finalPersonalDetails;
        },
        {},
    );

export default compose(
    withCurrentReportID,
    withReportCommentDrafts({
        propName: 'comment',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${props.reportID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
    withOnyx({
        fullReport: {
            key: (props) => ONYXKEYS.COLLECTION.REPORT + props.reportID,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            selector: personalDetailsSelector,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(OptionRowLHNData);
