import React, {useContext, useMemo} from 'react';
import type {TextStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MentionReportContext from './MentionReportContext';

type MentionReportRendererProps = CustomRendererProps<TText | TPhrasing>;

function MentionReportRenderer({style, tnode, TDefaultRenderer, ...defaultRendererProps}: MentionReportRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttributeReportID = tnode.attributes.reportid;
    const {currentReportID: currentReportIDContext, exactlyMatch} = useContext(MentionReportContext);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});

    const {currentReportID} = useCurrentReportIDState();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currentReportIDValue = currentReportIDContext || currentReportID;
    const [currentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentReportIDValue}`, {canBeMissing: true});

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to see and click on report mentions, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = useMemo(() => currentReport && !isEmptyObject(currentReport) && !!currentReport.policyID && currentReport.policyID !== CONST.POLICY.ID_FAKE, [currentReport]);

    const mentionDetails = getReportMentionDetails(htmlAttributeReportID, currentReport, reports, tnode);
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
        <ShowContextMenuContext.Consumer>
            {() => (
                <Text
                    // eslint-disable-next-line react/jsx-props-no-spreading
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
            )}
        </ShowContextMenuContext.Consumer>
    );
}

export default MentionReportRenderer;
