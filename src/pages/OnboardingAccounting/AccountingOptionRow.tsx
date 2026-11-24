/** A compact accounting selector with its own icon, badge, and accessible selection control. */
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import type {AccountingOption} from './accountingOptions';

type AccountingOptionRowProps = {
    option: AccountingOption;
    isSelected: boolean;
    onSelect: (option: AccountingOption) => void;
};

function AccountingOptionRow({option, isSelected, onSelect}: AccountingOptionRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons([option.iconName]);
    const iconBorderStyle = StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SHAPE.CIRCLE);

    return (
        <PressableWithoutFeedback
            onPress={() => onSelect(option)}
            accessibilityLabel={option.name}
            sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.ACCOUNTING_SELECT_INTEGRATION}
            accessible={!!option.isComingSoon}
            accessibilityRole={option.isComingSoon ? CONST.ROLE.RADIO : undefined}
            accessibilityState={option.isComingSoon ? {checked: isSelected} : undefined}
            accessibilityHint={option.isComingSoon ? translate('workspace.accounting.integrationWaitlist.comingSoon') : undefined}
            onKeyDown={(event) => {
                if (!option.isComingSoon || event.nativeEvent.code !== 'Space') {
                    return;
                }
                event.preventDefault();
                onSelect(option);
            }}
            hoverStyle={isSelected ? undefined : styles.hoveredComponentBG}
            style={[styles.onboardingAccountingItem, onboardingIsMediumOrLargerScreenWidth && styles.onboardingAccountingItemWide, isSelected && styles.onboardingTileSelected]}
        >
            <Icon
                src={icons[option.iconName]}
                fill={option.iconName === 'Building' ? theme.text : undefined}
                width={variables.avatarSizeSmall}
                height={variables.avatarSizeSmall}
                additionalStyles={iconBorderStyle}
            />
            <Text style={[styles.textStrong, styles.flex1, styles.mh3]}>{option.name}</Text>
            {!!option.isComingSoon && (
                <Badge
                    text={translate('workspace.accounting.integrationWaitlist.comingSoon')}
                    isCondensed
                    style={styles.mr2}
                />
            )}
            {!option.isComingSoon && (
                <RadioButton
                    isChecked={isSelected}
                    onPress={() => onSelect(option)}
                    accessibilityLabel={option.name}
                    sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.ACCOUNTING_SELECT_INTEGRATION}
                />
            )}
        </PressableWithoutFeedback>
    );
}

export default AccountingOptionRow;
