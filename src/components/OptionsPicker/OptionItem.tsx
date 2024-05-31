import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type OptionItemProps = {
    /** Text to be rendered */
    title: string;

    /** Icon to be displayed above the title */
    icon: IconAsset;

    /** Press handler */
    onPress: () => void;

    /** Indicates whether the option is currently selected (active) */
    isSelected: boolean;

    /** Indicates whether the option is disabled */
    isDisabled?: boolean;
};

function OptionItem({title, icon, onPress, isSelected, isDisabled = false}: OptionItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.close')}
            disabled={isDisabled}
        >
            <View style={[isSelected ? styles.borderedContentCardFocused : styles.borderedContentCard, styles.p5]}>
                <View style={[styles.flexRow, styles.justifyContentBetween]}>
                    <View style={[styles.flexColumn]}>
                        <Icon
                            src={icon}
                            width={variables.iconHeader}
                            height={variables.iconHeader}
                        />
                        <Text style={[styles.headerText, styles.mt2]}>{title}</Text>
                    </View>
                    <View>
                        <SelectCircle isChecked={isSelected} />
                    </View>
                </View>
            </View>
        </PressableWithFeedback>
    );
}

export default OptionItem;
