import isEmpty from 'lodash/isEmpty';
import React from 'react';
import type {TextStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type RoomMentionOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type MentionRoomRendererProps = RoomMentionOnyxProps & CustomRendererProps<TText | TPhrasing>;

const removeLeadingLTRAndHash = (value: string) => value.replace(CONST.UNICODE.LTR, '').slice(1);

const getMentionDetails = (htmlAttributeReportID: string, currentReportID: CurrentReportIDContextValue | null, reports: OnyxCollection<Report>, tnode: TText | TPhrasing) => {
    if (!isEmpty(htmlAttributeReportID)) {
        const report = reports?.['report_'.concat(htmlAttributeReportID)];

        const reportID = report?.reportID ?? undefined;
        const mentionDisplayText = report?.reportName ?? report?.displayName ?? htmlAttributeReportID;

        return {reportID, mentionDisplayText};
    } else if ('data' in tnode && !isEmptyObject(tnode.data)) {
        const currentReport = reports?.['report_'.concat(currentReportID?.currentReportID ?? '')];

        let reportID = undefined;
        Object.values(reports ?? {}).forEach((report) => {
            if (report?.policyID === currentReport?.policyID && removeLeadingLTRAndHash(report?.reportName ?? '') === mentionDisplayText) {
                reportID = report?.reportID;
            }
        });
        const mentionDisplayText = removeLeadingLTRAndHash(tnode.data);

        return {reportID, mentionDisplayText};
    }

    return null;
};

function MentionRoomRenderer({style, tnode, TDefaultRenderer, reports, ...defaultRendererProps}: MentionRoomRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttributeReportID = tnode.attributes.reportid;
    const currentReportID = useCurrentReportID();

    const mentionDetails = getMentionDetails(htmlAttributeReportID, currentReportID, reports, tnode);
    if (mentionDetails === null) {
        return null;
    }
    const {reportID, mentionDisplayText} = mentionDetails;

    const navigationRoute = reportID ? ROUTES.REPORT_WITH_ID.getRoute(String(reportID)) : undefined;
    const isCurrentRoomMention = String(reportID) === currentReportID?.currentReportID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <ShowContextMenuContext.Consumer>
            {() => (
                <Text
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    style={[styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isCurrentRoomMention), {color: StyleUtils.getMentionTextColor(isCurrentRoomMention)}]}
                    suppressHighlighting
                    onPress={
                        navigationRoute
                            ? (event) => {
                                  event.preventDefault();
                                  Navigation.navigate(navigationRoute);
                              }
                            : undefined
                    }
                    role={CONST.ROLE.LINK}
                    accessibilityLabel={`/${navigationRoute}`}
                >
                    #{mentionDisplayText}
                </Text>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

MentionRoomRenderer.displayName = 'MentionRoomRenderer';

export default withOnyx<MentionRoomRendererProps, RoomMentionOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(MentionRoomRenderer);
