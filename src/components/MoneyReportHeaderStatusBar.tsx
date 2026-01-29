import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildNextStepMessage, parseMessage} from '@libs/NextStepUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportNextStepDeprecated from '@src/types/onyx/ReportNextStepDeprecated';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report (deprecated old format) */
    nextStep: ReportNextStepDeprecated | undefined;

    /** The next step for the report (new format with translation support) */
    nextStepNew?: ReportNextStep;

    /** The current user's account ID, used for translating next step messages */
    currentUserAccountID?: number;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStep, nextStepNew, currentUserAccountID}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Checkmark', 'Stopwatch', 'DotIndicator']);
    const iconMap: IconMap = useMemo(
        () => ({
            [CONST.NEXT_STEP.ICONS.HOURGLASS]: icons.Hourglass,
            [CONST.NEXT_STEP.ICONS.CHECKMARK]: icons.Checkmark,
            [CONST.NEXT_STEP.ICONS.STOPWATCH]: icons.Stopwatch,
            [CONST.NEXT_STEP.ICONS.DOT_INDICATOR]: icons.DotIndicator,
        }),
        [icons],
    );
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.login ?? '';
    const messageContent = useMemo(() => {
        // Use new format with translation support when available
        if (nextStepNew?.messageKey && currentUserAccountID !== undefined) {
            return buildNextStepMessage(nextStepNew, translate, currentUserAccountID);
        }
        // Fall back to deprecated format
        const messageArray = nextStep?.message;
        return parseMessage(messageArray, currentUserEmail);
    }, [nextStep?.message, nextStepNew, currentUserAccountID, translate, currentUserEmail]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStepNew?.icon && iconMap?.[nextStepNew.icon]) ?? (nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
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
