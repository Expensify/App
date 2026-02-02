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

/** Combined type that accepts either the new format or the deprecated format */
type NextStepData = ReportNextStep | ReportNextStepDeprecated;

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report (supports both new and deprecated formats) */
    nextStep: NextStepData | undefined;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

/**
 * Type guard to check if the next step is in the deprecated format (has message array)
 * We prioritize the old format first for backwards compatibility during migration.
 */
function isDeprecatedFormatNextStep(step: NextStepData): step is ReportNextStepDeprecated {
    return 'message' in step && Array.isArray(step.message) && step.message.length > 0;
}

function MoneyReportHeaderStatusBar({nextStep}: MoneyReportHeaderStatusBarProps) {
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
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.login ?? '';

    const messageContent = useMemo(() => {
        if (!nextStep) {
            return '';
        }

        // Handle old/deprecated format first (with message array) for backwards compatibility
        if (isDeprecatedFormatNextStep(nextStep)) {
            return parseMessage(nextStep.message, currentUserEmail);
        }

        // Fall back to new format (with messageKey)
        if ('messageKey' in nextStep && nextStep.messageKey) {
            return buildNextStepMessage(nextStep, translate, currentUserAccountID);
        }

        return '';
    }, [nextStep, translate, currentUserAccountID, currentUserEmail]);

    // iconFill is only available in deprecated format
    const iconFill = (nextStep && isDeprecatedFormatNextStep(nextStep) ? nextStep.iconFill : undefined) ?? theme.icon;

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={iconFill}
                />
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={messageContent} />
            </View>
        </View>
    );
}

export default MoneyReportHeaderStatusBar;
