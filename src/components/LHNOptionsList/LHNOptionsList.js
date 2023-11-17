import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo, useCallback} from 'react';
import {FlatList, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getReportActionsByReportID} from '@libs/ReportActionsUtils';
import {getReportByID} from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRowLHNData';

const propTypes = {
    /** Wrapper style for the section list */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles for the section list container */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

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

const keyExtractor = (item) => item;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions, preferredLocale}) {
    const styles = useThemeStyles();
    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * @param {Array} itemData - This is the same as the data we pass into the component
     * @param {Number} index the current item's index in the set of data
     *
     * @returns {Object}
     */
    const getItemLayout = useCallback(
        (itemData, index) => {
            const optionHeight = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
            return {
                length: optionHeight,
                offset: index * optionHeight,
                index,
            };
        },
        [optionMode],
    );

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
            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(itemFullReport.participantAccountIDs);

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
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                showsVerticalScrollIndicator={false}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                stickySectionHeadersEnabled={false}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={20}
                maxToRenderPerBatch={5}
                windowSize={5}
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
