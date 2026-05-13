import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type DraftIndicatorProps = {
    hasDraftComment: boolean;
    isAllowedToComment: boolean | null | undefined;
};

function DraftIndicator({hasDraftComment, isAllowedToComment}: DraftIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {Pencil} = useMemoizedLazyExpensifyIcons(['Pencil']);

    if (!hasDraftComment || !isAllowedToComment) {
        return null;
    }

    return (
        <View
            style={styles.ml2}
            accessibilityLabel={translate('sidebarScreen.draftedMessage')}
        >
            <Icon
                testID="Pencil Icon"
                fill={theme.icon}
                src={Pencil}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
        </View>
    );
}

DraftIndicator.displayName = 'OptionRow.DraftIndicator';

export default DraftIndicator;
