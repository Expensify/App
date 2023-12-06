import {FlashList} from '@shopify/flash-list';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo, useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getReportActionsByReportID} from '@libs/ReportActionsUtils';
import {getReportByID} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRowLHNData';

const propTypes = {
    /** Wrapper style for the section list */
    style: stylePropTypes,

    /** Extra styles for the section list container */
    contentContainerStyles: stylePropTypes.isRequired,

    /** Sections for the section list */
    data: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)).isRequired,

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions: PropTypes.bool,

    /** The policy which the user has access to and which the report could be tied to */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,
        /** Name of the policy */
        name: PropTypes.string,
        /** Avatar of the policy */
        avatar: PropTypes.string,
    }),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,
};

const defaultProps = {
    style: undefined,
    shouldDisableFocusOptions: false,
    policy: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
};

const keyExtractor = (item) => `report_${item}`;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions, preferredLocale}) {
    const styles = useThemeStyles();
    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {Component}
     */
    const renderItem = useCallback(
        ({item: reportID}) => {
            const itemFullReport = getReportByID(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            const itemReportActions = getReportActionsByReportID(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            const itemParentReportActions = getReportActionsByReportID(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport.parentReportID}`);
            const itemParentReportAction = itemParentReportActions[itemFullReport.parentReportActionID] || {};
            const transactionID = lodashGet(itemParentReportAction, ['originalMessage', 'IOUTransactionID'], '');
            const participants = [...ReportUtils.getParticipantsIDs(itemFullReport), itemFullReport.ownerAccountID];

            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants);

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={itemFullReport}
                    reportActions={itemReportActions}
                    parentReportAction={itemParentReportAction}
                    personalDetails={participantsPersonalDetails}
                    transactionID={transactionID}
                    viewMode={optionMode}
                    isFocused={!shouldDisableFocusOptions}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                />
            );
        },
        [onSelectRow, optionMode, preferredLocale, shouldDisableFocusOptions],
    );

    return (
        <View style={style || styles.flex1}>
            <FlashList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                estimatedItemSize={optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

LHNOptionsList.propTypes = propTypes;
LHNOptionsList.defaultProps = defaultProps;
LHNOptionsList.displayName = 'LHNOptionsList';

export default withOnyx({
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(memo(LHNOptionsList));
