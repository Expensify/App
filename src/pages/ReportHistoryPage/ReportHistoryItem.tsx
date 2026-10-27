import Icon from '@components/Icon';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ReportHistoryStep} from './types';

import getShortRelativeTime from './getShortRelativeTime';
import {REPORT_HISTORY_ICONS} from './types';

type ReportHistoryItemProps = {
    step: ReportHistoryStep;
};

function ReportHistoryItem({step}: ReportHistoryItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber} = useLocalize();
    const [personalDetail] = usePersonalDetail(step.accountID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const icons = useMemoizedLazyExpensifyIcons(REPORT_HISTORY_ICONS);

    const displayName = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: personalDetail,
        translate,
        formatPhoneNumber,
    });

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, step.isUpcoming && styles.opacitySemiTransparent]}>
            <View style={styles.reportHistoryIconContainer}>
                <Icon
                    src={icons[step.icon]}
                    height={variables.iconSizeSemiSmall}
                    width={variables.iconSizeSemiSmall}
                    fill={theme.icon}
                />
            </View>
            <Text style={[styles.flex1, styles.reportHistoryLabel]}>
                {step.accountID === undefined ? (
                    step.label
                ) : (
                    <>
                        <Text style={styles.textStrong}>{displayName}</Text> {step.label}
                    </>
                )}
            </Text>
            {!!step.created && <Text style={[styles.textMicroSupporting, styles.ml2]}>{getShortRelativeTime(translate, step.created, currentSelectedTimezone)}</Text>}
        </View>
    );
}

export default ReportHistoryItem;
