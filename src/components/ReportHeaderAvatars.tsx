import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import PressableAvatarFromIcon from './Avatar/PressableAvatarFromIcon';
import useReportActionAvatars from './ReportActionAvatars/useReportActionAvatars';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportHeaderAvatarsProps = {
    /** Report ID used to resolve avatars and for workspace avatar navigation */
    reportID?: string;
};

/** Renders the large pressable avatar(s) shown in the report details header for non-group-chat reports. */
function ReportHeaderAvatars({reportID}: ReportHeaderAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // reportID can be an empty string causing Onyx to fetch the whole collection
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`);

    const {
        avatarType,
        avatars: icons,
        details: {delegateAccountID},
    } = useReportActionAvatars({
        report,
        action: undefined,
    });

    const [primaryAvatar, secondaryAvatar] = icons;
    const size = CONST.AVATAR_SIZE.X_LARGE;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && !!secondaryAvatar?.name) {
        const subscriptAvatarSize = CONST.AVATAR_SIZE.HEADER;

        return (
            <View
                style={[StyleUtils.getContainerStyles(size), styles.mr0]}
                testID="ReportActionAvatars-Subscript"
            >
                <UserDetailsTooltip
                    shouldRender
                    accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={primaryAvatar}
                    fallbackUserDetails={{
                        displayName: primaryAvatar.name,
                    }}
                >
                    <View>
                        <PressableAvatarFromIcon
                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                            icon={primaryAvatar}
                            size={size}
                            testID="ReportActionAvatars-Subscript-MainAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
                <UserDetailsTooltip
                    shouldRender
                    accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={secondaryAvatar}
                >
                    <View style={styles.secondAvatarSubscriptXLarge}>
                        <PressableAvatarFromIcon
                            iconAdditionalStyles={[StyleUtils.getAvatarBorderWidth(subscriptAvatarSize), StyleUtils.getBorderColorStyle(theme.componentBG)]}
                            icon={secondaryAvatar}
                            size={subscriptAvatarSize}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
        );
    }

    return (
        <UserDetailsTooltip
            accountID={Number(delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            icon={primaryAvatar}
            fallbackUserDetails={{
                displayName: primaryAvatar.name,
            }}
            shouldRender
        >
            <View>
                <PressableAvatarFromIcon
                    containerStyles={[]}
                    icon={primaryAvatar}
                    size={size}
                    testID="ReportActionAvatars-SingleAvatar"
                    reportID={reportID}
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default ReportHeaderAvatars;
