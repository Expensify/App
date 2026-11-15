// cspell:ignore reportid
import Text from '@components/Text';

import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getReportMentionDetails} from '@libs/MentionUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {TextStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import isEmpty from 'lodash/isEmpty';
import React, {useContext} from 'react';
import {StyleSheet} from 'react-native';

import MentionReportContext from './MentionReportContext';

type MentionReportRendererProps = CustomRendererProps<TText | TPhrasing>;

/**
 * Creates a selector that keeps only the id and name of the mentioned report, so the renderer doesn't re-render when other reports
 * or unrelated fields of the mentioned report change.
 */
function mentionedReportSelector(htmlAttributeReportID: string) {
    return function selectMentionedReport(reports: OnyxCollection<Report>): OnyxCollection<Pick<Report, 'reportID' | 'reportName'>> {
        const key = `${ONYXKEYS.COLLECTION.REPORT}${htmlAttributeReportID}` as const;
        const report = reports?.[key];
        return {[key]: report && {reportID: report.reportID, reportName: report.reportName}};
    };
}

/** The renderer only reads the policy of the report it is shown in, so the other fields of that report must not wake it up */
function currentReportSelector(report: OnyxEntry<Report>): OnyxEntry<Pick<Report, 'reportID' | 'policyID'>> {
    return report && {reportID: report.reportID, policyID: report.policyID};
}

function MentionReportRenderer({style, tnode, TDefaultRenderer, ...defaultRendererProps}: MentionReportRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttributeReportID = tnode.attributes.reportid;
    const {currentReportID: currentReportIDContext, exactlyMatch, policyID} = useContext(MentionReportContext);
    // Old mentions without a reportid are matched by room name, so they need the whole collection. Without a selector useOnyx compares by reference, which is cheaper than deep-comparing the collection.
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, isEmpty(htmlAttributeReportID) ? undefined : {selector: mentionedReportSelector(htmlAttributeReportID)});

    const {currentReportID} = useCurrentReportIDState();
    const currentReportIDValue = currentReportIDContext || currentReportID;
    const [currentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentReportIDValue}`, {selector: currentReportSelector});

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to see and click on report mentions, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = (!!currentReport && !isEmptyObject(currentReport) && !!currentReport.policyID && currentReport.policyID !== CONST.POLICY.ID_FAKE) || !!policyID;

    const mentionDetails = getReportMentionDetails(htmlAttributeReportID, currentReport, reports, tnode, policyID);
    if (!mentionDetails) {
        return null;
    }
    const {reportID, mentionDisplayText} = mentionDetails;

    let navigationRoute: Route | undefined = reportID ? ROUTES.REPORT_WITH_ID.getRoute(reportID) : undefined;
    const backTo = Navigation.getActiveRoute();
    if (isSearchTopmostFullScreenRoute()) {
        navigationRoute = reportID ? ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}) : undefined;
    }
    const isCurrentRoomMention = reportID === currentReportIDValue;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <Text
            {...defaultRendererProps}
            style={
                isGroupPolicyReport && (!exactlyMatch || navigationRoute)
                    ? [styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isCurrentRoomMention), {color: StyleUtils.getMentionTextColor(isCurrentRoomMention)}]
                    : [flattenStyle]
            }
            suppressHighlighting
            onPress={
                navigationRoute && isGroupPolicyReport
                    ? (event) => {
                          event.preventDefault();
                          Navigation.navigate(navigationRoute);
                      }
                    : undefined
            }
            role={isGroupPolicyReport ? CONST.ROLE.LINK : undefined}
            accessibilityLabel={isGroupPolicyReport ? `/${navigationRoute}` : undefined}
        >
            #{mentionDisplayText}
        </Text>
    );
}

export default MentionReportRenderer;
