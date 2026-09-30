import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {isResolvedSupportTicket} from '@libs/ReportUtils';

import {dismissFailedSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type SupportTicketPreviewProps = {
    action: OnyxEntry<ReportAction>;
    isHovered: boolean;
    style: StyleProp<ViewStyle>;
};

function SupportTicketPreview({action, isHovered, style}: SupportTicketPreviewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const [supportTicket] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action?.childReportID)}`);
    const supportTicketReportID = supportTicket?.reportID ?? action?.childReportID;
    const isResolved = isResolvedSupportTicket(supportTicket, action);
    const errors = typeof action?.errors === 'object' ? action.errors : undefined;
    const createReportErrors = typeof errors?.createReport === 'object' ? errors.createReport : undefined;

    return (
        <OfflineWithFeedback
            shouldShowErrorMessages
            errors={createReportErrors}
            onClose={() => dismissFailedSupportTicket(supportTicketReportID ?? '', action?.parentReportID ?? '', action?.reportActionID ?? '')}
        >
            <View style={styles.chatItemMessage}>
                <PressableWithoutFeedback
                    onPress={() => Navigation.navigate(getReportRouteForCurrentContext({reportID: supportTicketReportID}))}
                    style={[styles.flexRow, styles.alignItemsCenter, style]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={supportTicket?.reportName ?? action?.childReportName ?? translate('supportTicket.fallbackTitle')}
                >
                    <Tooltip text={translate('supportTicket.checkboxTooltip')}>
                        <View>
                            <Checkbox
                                isChecked={isResolved}
                                disabled
                                onPress={() => {}}
                                accessibilityLabel={translate('supportTicket.checkboxTooltip')}
                            />
                        </View>
                    </Tooltip>
                    <Text style={[styles.ml3, styles.flex1]}>{supportTicket?.reportName ?? action?.childReportName ?? translate('supportTicket.fallbackTitle')}</Text>
                    <Icon
                        src={icons.ArrowRight}
                        fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered})})}
                    />
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

export default SupportTicketPreview;
