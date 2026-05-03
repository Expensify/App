import React from 'react';
import MenuItem from '@components/MenuItem';
import {useContentActions} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type SubBackButtonProps = {
    /** Defaults to a localized "Go back". */
    backButtonText?: string;
    /** `null` pops to root. */
    parentSubID: string | null;
};

/** Back-row auto-rendered by `<Sub.Content>` at the active level; pops one sub on press. */
function SubBackButton({backButtonText, parentSubID}: SubBackButtonProps): React.ReactElement {
    const {exitSub} = useContentActions(SubBackButton.displayName);
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const hasLabel = !!backButtonText;
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
            style={hasLabel ? styles.pv0 : undefined}
            additionalIconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}, styles.opacitySemiTransparent, styles.mr1]}
            iconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}]}
            wrapperStyle={[styles.ph5, styles.pv3]}
            innerContainerStyle={styles.alignItemsCenter}
            title={labelText}
            accessibilityLabel={`${translate('common.goBack')}, ${labelText}`}
            titleStyle={hasLabel ? styles.createMenuHeaderText : undefined}
            shouldShowBasicTitle={hasLabel}
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
