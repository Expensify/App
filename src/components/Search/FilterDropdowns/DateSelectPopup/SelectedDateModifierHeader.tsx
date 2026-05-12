import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SelectedDateModifierHeaderProps = {
    isCompact: boolean;
    title: string;
    onBackPress: () => void;
};

function SelectedDateModifierHeader({isCompact, title, onBackPress}: SelectedDateModifierHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const backArrowIcon = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const {translate} = useLocalize();

    if (isCompact) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pb2, styles.gap2]}>
                <PressableWithoutFeedback
                    onPress={onBackPress}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.back')}
                    sentryLabel="DateSelectPopup-Back"
                >
                    <Icon
                        src={backArrowIcon.BackArrow}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
                <Text style={[styles.textLabelSupporting]}>{title}</Text>
            </View>
        );
    }

    return (
        <HeaderWithBackButton
            shouldDisplayHelpButton={false}
            style={[styles.h10, styles.pb3]}
            subtitle={title}
            onBackButtonPress={onBackPress}
        />
    );
}

export type {SelectedDateModifierHeaderProps};
export default SelectedDateModifierHeader;
