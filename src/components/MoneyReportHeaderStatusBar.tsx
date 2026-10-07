import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {buildNextStepMessage} from '@libs/NextStepUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React, {useMemo} from 'react';
import {View} from 'react-native';

import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    nextStep: ReportNextStep | undefined;

    /** Opens the report history. When provided, the status bar becomes pressable and shows a chevron */
    onPress?: () => void;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStep, onPress}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Checkmark', 'Stopwatch']);
    const iconMap: IconMap = useMemo(
        () => ({
            [CONST.NEXT_STEP.ICONS.HOURGLASS]: icons.Hourglass,
            [CONST.NEXT_STEP.ICONS.CHECKMARK]: icons.Checkmark,
            [CONST.NEXT_STEP.ICONS.STOPWATCH]: icons.Stopwatch,
        }),
        [icons],
    );
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;

    const messageContent = useMemo(() => {
        if (!nextStep) {
            return '';
        }

        return buildNextStepMessage(nextStep, translate, dateFnsLocale, currentUserAccountID, formatPhoneNumber);
    }, [nextStep, translate, dateFnsLocale, currentUserAccountID, formatPhoneNumber]);

    const message = (
        <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
            <RenderHTML html={messageContent} />
        </View>
    );

    const content = (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={nextStep?.iconFill ?? theme.icon}
                />
            </View>
            {onPress ? <CaretWrapper style={styles.flexShrink1}>{message}</CaretWrapper> : message}
        </View>
    );

    if (!onPress) {
        return content;
    }

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={translate('reportHistoryPage.title')}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REPORT_HEADER_NEXT_STEP}
        >
            {content}
        </PressableWithFeedback>
    );
}

export default MoneyReportHeaderStatusBar;
