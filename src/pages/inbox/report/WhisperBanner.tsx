import React from 'react';
import {View} from 'react-native';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNamesWithTooltips, getWhisperDisplayNames, isCurrentUserTheOnlyParticipant} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type WhisperBannerProps = {
    /** Account IDs of the users that can see the whisper. */
    whisperedTo: number[];
};

function WhisperBanner({whisperedTo}: WhisperBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Eye']);
    const personalDetails = usePersonalDetails();

    const isMultipleParticipant = whisperedTo.length > 1;
    const isWhisperOnlyVisibleByUser = isCurrentUserTheOnlyParticipant(whisperedTo);
    const whisperedToPersonalDetails = Object.values(personalDetails ?? {}).filter((details) =>
        whisperedTo.includes(details?.accountID ?? CONST.DEFAULT_NUMBER_ID),
    ) as OnyxTypes.PersonalDetails[];
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant, localeCompare, formatPhoneNumber);

    return (
        <View style={[styles.flexRow, styles.pl5, styles.pt2, styles.pr3]}>
            <View style={[styles.pl6, styles.mr3]}>
                <Icon
                    fill={theme.icon}
                    src={expensifyIcons.Eye}
                    small
                />
            </View>
            <Text style={[styles.chatItemMessageHeaderTimestamp]}>
                {translate('reportActionContextMenu.onlyVisible')}
                &nbsp;
            </Text>
            <DisplayNames
                fullTitle={getWhisperDisplayNames(translate, formatPhoneNumber, whisperedTo) ?? ''}
                displayNamesWithTooltips={displayNamesWithTooltips}
                tooltipEnabled
                numberOfLines={1}
                textStyles={[styles.chatItemMessageHeaderTimestamp, styles.flex1]}
                shouldUseFullTitle={isWhisperOnlyVisibleByUser}
            />
        </View>
    );
}

export default WhisperBanner;
