import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {useSubContext} from './context';
import useSubBackButton from './useBackButton';

type SubBackButtonProps = {
    text?: string;
    testID?: string;
    onPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;
};

function SubBackButton({text, testID, onPress: consumerOnPress}: SubBackButtonProps): React.ReactElement | null {
    useSubContext(SubBackButton.displayName);

    const {translate} = useLocalize();
    const labelText = text ?? translate('common.goBack');
    const {ref, focused, onPress: exitSub, onFocus, isAtActiveLevel} = useSubBackButton();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!isAtActiveLevel) {
        return null;
    }

    const handlePress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        consumerOnPress?.(event);
        if (event?.defaultPrevented) {
            return;
        }
        exitSub();
    };

    return (
        <MenuItem
            ref={ref}
            icon={icons.BackArrow}
            iconFill={(isHovered) => (isHovered ? theme.iconHovered : theme.icon)}
            additionalIconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}, styles.opacitySemiTransparent, styles.mr1]}
            iconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}]}
            wrapperStyle={[styles.ph5, styles.pv3]}
            innerContainerStyle={styles.alignItemsCenter}
            title={labelText}
            accessibilityLabel={`${translate('common.goBack')}, ${labelText}`}
            shouldCheckActionAllowedOnPress={false}
            onPress={handlePress}
            onFocus={onFocus}
            focused={focused}
            role={CONST.ROLE.MENUITEM}
            pressableTestID={testID ?? 'PopoverMenu.Sub.BackButton'}
        />
    );
}

SubBackButton.displayName = 'PopoverMenu.Sub.BackButton';

export default SubBackButton;
export type {SubBackButtonProps};
