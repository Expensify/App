import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildNextStepMessage} from '@libs/NextStepUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import {getReportType} from '@selectors/Report';
import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    nextStep: ReportNextStep | undefined;
    reportID: string | undefined;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStep, reportID}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Checkmark', 'Stopwatch', 'Box']);
    const iconMap: IconMap = {
        [CONST.NEXT_STEP.ICONS.HOURGLASS]: icons.Hourglass,
        [CONST.NEXT_STEP.ICONS.CHECKMARK]: icons.Checkmark,
        [CONST.NEXT_STEP.ICONS.STOPWATCH]: icons.Stopwatch,
        [CONST.NEXT_STEP.ICONS.BOX]: icons.Box,
    };
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const [reportType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: getReportType});

    const messageContent = !nextStep ? '' : buildNextStepMessage(nextStep, translate, dateFnsLocale, currentUserAccountID, formatPhoneNumber, reportType);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={nextStep?.iconFill ?? theme.icon}
                />
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={messageContent} />
            </View>
        </View>
    );
}

export default MoneyReportHeaderStatusBar;
