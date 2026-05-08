import React from 'react';
import MenuItem from '@components/MenuItem';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useSubContext} from './SubContext';

type SubBackButtonProps = {
    /** Defaults to a localized "Go back". */
    backButtonText?: string;
};

function SubBackButton({backButtonText}: SubBackButtonProps): React.ReactElement {
    const {exitSub} = useContentSubActions(SubBackButton.displayName);
    const subContext = useSubContext(SubBackButton.displayName);
    const {parentSubID} = subContext;
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const labelText = backButtonText ?? translate('common.goBack');

    const {ref, focused, onPress, onFocus} = useFocusableRow({
        componentName: SubBackButton.displayName,
        visible: true,
        onActivate: () => exitSub(parentSubID),
    });

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
