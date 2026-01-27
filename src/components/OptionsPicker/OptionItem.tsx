import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

type OptionItemProps = {
    /** Text to be rendered */
    title: TranslationPaths;

    /** Icon to be displayed above the title */
    icon: IconAsset;

    /** Press handler */
    onPress?: () => void;

    /** Indicates whether the option is currently selected (active) */
    isSelected?: boolean;

    /** Indicates whether the option is disabled */
    isDisabled?: boolean;

    /** Optional style prop */
    style?: StyleProp<ViewStyle>;
};

function OptionItem({title, icon, onPress, isSelected = false, isDisabled, style}: OptionItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate(title)}
            disabled={isDisabled}
            wrapperStyle={[styles.flex1, style]}
        >
            <View style={[styles.borderedContentCard, isSelected && styles.borderColorFocus, styles.p5]}>
                <View>
                    <View style={[styles.flexRow, styles.justifyContentBetween]}>
                        <Icon
                            src={icon}
                            width={variables.iconHeader}
                            height={variables.iconHeader}
                        />
                        {!isDisabled && (
                            <View>
                                <SelectCircle
                                    isChecked={isSelected}
                                    selectCircleStyles={styles.sectionSelectCircle}
                                />
                            </View>
                        )}
                    </View>
                    <Text
                        style={[styles.headerText, styles.mt2]}
                        numberOfLines={1}
                    >
                        {translate(title)}
                    </Text>
                </View>
            </View>
        </PressableWithFeedback>
    );
}

export default OptionItem;
