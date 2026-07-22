import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type UpgradeIntroViewProps = {
    /** Icon shown in the top-left of the card. When omitted, the icon is hidden. */
    iconSrc?: IconAsset;

    /** Whether the icon should render as an illustration (Icon) rather than an Avatar. */
    isIllustration?: boolean;

    /** Extra styles applied to the illustration icon. */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Card heading. */
    title: string;

    /** Card body text. */
    description: string;

    /** Optional HTML rendered under the description (e.g. "only available on the X plan"). */
    onlyAvailableOnPlanHTML?: string;

    /** Primary button label. */
    buttonText: string;

    /** Unlock badge text. */
    unlockBadgeText?: string;

    /** Called when the primary button is pressed. */
    onUpgrade: () => void;

    /** Whether the primary button is disabled. */
    buttonDisabled?: boolean;

    /** Whether the primary button shows a loading spinner. */
    loading?: boolean;
};

/**
 * Presentational card used by the workspace upgrade flows: an icon + "Upgrade to unlock" badge, a
 * title/description, optional plan-availability copy, a primary button, and an optional note. All
 * content is passed in via props so it can be reused outside the feature-mapping driven UpgradeIntro.
 */
function UpgradeIntroView({
    iconSrc,
    isIllustration,
    iconAdditionalStyles,
    title,
    description,
    onlyAvailableOnPlanHTML,
    buttonText,
    onUpgrade,
    buttonDisabled,
    loading,
    unlockBadgeText,
}: UpgradeIntroViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const {environmentURL} = useEnvironment();
    const subscriptionPlan = useSubscriptionPlan();
    const {Unlock} = useMemoizedLazyExpensifyIcons(['Unlock']);

    const subscriptionLink = subscriptionPlan ? `${environmentURL}/${ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute())}` : CONST.PLAN_TYPES_AND_PRICING_HELP_URL;

    return (
        <View style={styles.p5}>
            <View style={[styles.highlightBG, styles.br4, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween]}>
                    {!!iconSrc &&
                        (!isIllustration ? (
                            <Avatar
                                source={iconSrc}
                                type={CONST.ICON_TYPE_AVATAR}
                            />
                        ) : (
                            <Icon
                                src={iconSrc}
                                width={48}
                                height={48}
                                additionalStyles={iconAdditionalStyles}
                            />
                        ))}
                    <Badge
                        icon={Unlock}
                        text={unlockBadgeText ?? translate('workspace.upgrade.upgradeToUnlock')}
                        success
                    />
                </View>
                <View style={styles.mb5}>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>{title}</Text>
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{description}</Text>
                    {!!onlyAvailableOnPlanHTML && (
                        <View style={[styles.renderHTML]}>
                            <RenderHTML html={onlyAvailableOnPlanHTML} />
                        </View>
                    )}
                </View>
                <Button
                    isLoading={loading}
                    testID="upgrade-button"
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                >
                    <Button.Text>{buttonText}</Button.Text>
                </Button>
            </View>
            <View style={[styles.mt6, styles.renderHTML]}>
                <RenderHTML html={translate('workspace.upgrade.note', subscriptionLink)} />
            </View>
        </View>
    );
}

UpgradeIntroView.displayName = 'UpgradeIntroView';

export default UpgradeIntroView;
export type {UpgradeIntroViewProps};
