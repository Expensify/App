/** One selectable discount tile in the early renewal picker. */
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import {View} from 'react-native';

type EarlyRenewalOfferTileProps = {
    /** Translated text describing the discount */
    label: string;

    /** Illustration shown above the label */
    illustration: IconAsset | undefined;

    /** Whether this discount is the one currently chosen */
    isSelected: boolean;

    /** Called when the tile is pressed */
    onSelect: () => void;

    /** Optional content pinned to the tile, such as a badge */
    children?: ReactNode;
};

function EarlyRenewalOfferTile({label, illustration, isSelected, onSelect, children}: EarlyRenewalOfferTileProps) {
    const styles = useThemeStyles();

    return (
        <PressableWithFeedback
            onPress={onSelect}
            role={CONST.ROLE.RADIO}
            accessibilityState={{checked: isSelected}}
            accessibilityLabel={label}
            wrapperStyle={styles.flex1}
            style={[styles.earlyRenewalOfferOption, isSelected && styles.earlyRenewalOfferOptionSelected]}
            sentryLabel={CONST.SENTRY_LABEL.EARLY_RENEWAL_OFFER.OPTION}
        >
            {/* The whole tile is the radio for assistive tech, so this one is only visual. */}
            <View
                style={styles.earlyRenewalOfferOptionRadio}
                aria-hidden
                importantForAccessibility="no-hide-descendants"
            >
                <RadioButton
                    isChecked={isSelected}
                    onPress={onSelect}
                    accessibilityLabel={label}
                    tabIndex={-1}
                />
            </View>
            {children}
            <Icon
                src={illustration}
                width={variables.earlyRenewalOfferOptionIllustrationSize}
                height={variables.earlyRenewalOfferOptionIllustrationSize}
            />
            <Text style={[styles.textStrong, styles.textAlignCenter]}>{label}</Text>
        </PressableWithFeedback>
    );
}

export default EarlyRenewalOfferTile;
