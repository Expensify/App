import isEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {TextStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MentionReportOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type MentionReportRendererProps = MentionReportOnyxProps & CustomRendererProps<TText | TPhrasing>;

const removeLeadingLTRAndHash = (value: string) => value.replace(CONST.UNICODE.LTR, '').replace('#', '');

const getMentionDetails = (htmlAttributeReportID: string, currentReport: OnyxEntry<Report>, reports: OnyxCollection<Report>, tnode: TText | TPhrasing) => {
    let reportID: string | undefined;
    let mentionDisplayText: string;

    // Get mention details based on reportID from tag attribute
    if (!isEmpty(htmlAttributeReportID)) {
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${htmlAttributeReportID}`];
        reportID = report?.reportID ?? htmlAttributeReportID;
        mentionDisplayText = removeLeadingLTRAndHash(report?.reportName ?? report?.displayName ?? htmlAttributeReportID);
        // Get mention details from name inside tnode
    } else if ('data' in tnode && !isEmptyObject(tnode.data)) {
        mentionDisplayText = removeLeadingLTRAndHash(tnode.data);

        // eslint-disable-next-line rulesdir/prefer-early-return
        Object.values(reports ?? {}).forEach((report) => {
            if (report?.policyID === currentReport?.policyID && removeLeadingLTRAndHash(report?.reportName ?? '') === mentionDisplayText) {
                reportID = report?.reportID;
            }
        });
    } else {
        return null;
    }

    return {reportID, mentionDisplayText};
};

function MentionReportRenderer({style, tnode, TDefaultRenderer, reports, ...defaultRendererProps}: MentionReportRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttributeReportID = tnode.attributes.reportid;

    const currentReportID = useCurrentReportID();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [currentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID?.currentReportID || -1}`);

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to see and click on report mentions, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = useMemo(() => currentReport && !isEmptyObject(currentReport) && !!currentReport.policyID && currentReport.policyID !== CONST.POLICY.ID_FAKE, [currentReport]);

    const mentionDetails = getMentionDetails(htmlAttributeReportID, currentReport, reports, tnode);
    if (!mentionDetails) {
        return null;
    }
    const {reportID, mentionDisplayText} = mentionDetails;

    const navigationRoute = reportID ? ROUTES.REPORT_WITH_ID.getRoute(reportID) : undefined;
    const isCurrentRoomMention = reportID === currentReportID?.currentReportID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <ShowContextMenuContext.Consumer>
            {() => (
                <Text
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    style={
                        isGroupPolicyReport
                            ? [styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isCurrentRoomMention), {color: StyleUtils.getMentionTextColor(isCurrentRoomMention)}]
                            : []
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
            )}
        </ShowContextMenuContext.Consumer>
    );
}

MentionReportRenderer.displayName = 'MentionReportRenderer';

const chatReportSelector = (report: OnyxEntry<Report>): Report =>
    (report && {
        reportID: report.reportID,
        reportName: report.reportName,
        displayName: report.displayName,
        policyID: report.policyID,
    }) as Report;

export default withOnyx<MentionReportRendererProps, MentionReportOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
        selector: chatReportSelector,
    },
})(MentionReportRenderer);
