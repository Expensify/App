import Icon from '@components/Icon';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

type HeaderIconProps = {
    /** Icon displayed on the left of the title. */
    src: IconAsset;

    /** Icon width. Defaults to the standard header icon size. */
    width?: number;

    /** Icon height. Defaults to the standard header icon size. */
    height?: number;

    /** Any additional styles to pass to the icon container. */
    style?: StyleProp<ViewStyle>;

    /** Optional fill color for the icon. */
    iconFill?: string;
};

function HeaderIcon({src, width, height, style, iconFill}: HeaderIconProps) {
    const styles = useThemeStyles();

    return (
        <Icon
            src={src}
            width={width ?? variables.iconHeader}
            height={height ?? variables.iconHeader}
            additionalStyles={[styles.mr2, style]}
            fill={iconFill}
        />
    );
}

export default HeaderIcon;
