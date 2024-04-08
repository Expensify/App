import Str from 'expensify-common/lib/str';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleSheet, type TextStyle} from 'react-native';
import {OnyxCollection, withOnyx} from 'react-native-onyx';
import {CustomRendererProps, TNodeChildrenRenderer, TPhrasing, TText} from 'react-native-render-html';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type RoomMentionOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type MentionRoomRendererProps = RoomMentionOnyxProps & CustomRendererProps<TText | TPhrasing>;

function MentionRoomRenderer({style, tnode, TDefaultRenderer, reports, ...defaultRendererProps}: MentionRoomRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttributeReportID = tnode.attributes.reportid;
    const currentReportID = useCurrentReportID();

    let reportID: number | undefined;
    let mentionDisplayText: string;

    const tnodeClone = cloneDeep(tnode);

    if (!isEmpty(htmlAttributeReportID)) {
        const report = reports!['report_' + htmlAttributeReportID];

        reportID = report?.reportID ? parseInt(report.reportID, 10) : undefined;
        mentionDisplayText = report?.displayName ?? report?.reportName ?? htmlAttributeReportID;
    } else if ('data' in tnodeClone && !isEmptyObject(tnodeClone.data)) {
        mentionDisplayText = tnodeClone.data.replace(CONST.UNICODE.LTR, '').slice(1);

        Object.values(reports ?? {}).some((report) => {
            if (report?.reportName === mentionDisplayText || report?.reportName === tnodeClone.data) {
                reportID = Number(report?.reportID);
                return true;
            }
            return false;
        });

        mentionDisplayText = Str.removeSMSDomain(mentionDisplayText);
    } else {
        return null;
    }

    const navigationRoute: Route | undefined = reportID ? ROUTES.REPORT_WITH_ID.getRoute(String(reportID)) : undefined;

    const isOurMention = String(reportID) === currentReportID?.currentReportID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <ShowContextMenuContext.Consumer>
            {() => (
                <Text
                    style={[styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isOurMention), {color: StyleUtils.getMentionTextColor(isOurMention)}]}
                    suppressHighlighting
                    onPress={(event) => {
                        event.preventDefault();
                        Navigation.navigate(navigationRoute);
                    }}
                    role={CONST.ROLE.LINK}
                    accessibilityLabel={`/${navigationRoute}`}
                >
                    {htmlAttributeReportID ? `#${mentionDisplayText}` : <TNodeChildrenRenderer tnode={tnodeClone} />}
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
