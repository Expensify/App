import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {buildNextStepMessage} from '@libs/NextStepUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type Report from '@src/types/onyx/Report';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    nextStep: ReportNextStep | undefined;
    reportType: Report['type'];

    /** Shows a chevron after the message, for a next step that opens the report history */
    shouldShowCaret?: boolean;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStep, reportType, shouldShowCaret = true}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Checkmark', 'Stopwatch', 'Box', 'DotIndicator']);
    const iconMap: IconMap = {
        [CONST.NEXT_STEP.ICONS.HOURGLASS]: icons.Hourglass,
        [CONST.NEXT_STEP.ICONS.CHECKMARK]: icons.Checkmark,
        [CONST.NEXT_STEP.ICONS.STOPWATCH]: icons.Stopwatch,
        [CONST.NEXT_STEP.ICONS.BOX]: icons.Box,
        [CONST.NEXT_STEP.ICONS.DOT_INDICATOR]: icons.DotIndicator,
    };
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;

    const messageContent = !nextStep ? '' : buildNextStepMessage(nextStep, translate, dateFnsLocale, currentUserAccountID, formatPhoneNumber, reportType);
    const message = (
        <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1, styles.breakWord]}>
            <RenderHTML html={messageContent} />
        </View>
    );

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={nextStep?.iconFill ?? theme.icon}
                />
            </View>
            {shouldShowCaret ? <CaretWrapper style={styles.flexShrink1}>{message}</CaretWrapper> : message}
        </View>
    );
}

export default MoneyReportHeaderStatusBar;
