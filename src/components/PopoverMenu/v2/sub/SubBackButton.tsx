import React from 'react';
import MenuItem from '@components/MenuItem';
import useHierarchyAssertion from '@components/PopoverMenu/v2/useHierarchyAssertion';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {SubContext} from './SubContext';
import useSubBackButton from './useSubBackButton';

type SubBackButtonProps = {
    /** Defaults to a localized "Go back". */
    text?: string;
};

/** For non-`MenuItem` shapes, call `useSubBackButton()` directly. */
function SubBackButton({text}: SubBackButtonProps): React.ReactElement | null {
    useHierarchyAssertion(SubBackButton.displayName, SubContext, 'Sub');

    const {translate} = useLocalize();
    const labelText = text ?? translate('common.goBack');
    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSubBackButton({text: labelText});
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!isAtActiveLevel) {
        return null;
    }

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
            onPress={onPress}
            onFocus={onFocus}
            focused={focused}
        />
    );
}

SubBackButton.displayName = 'PopoverMenu.Sub.BackButton';

export default SubBackButton;
export type {SubBackButtonProps};
