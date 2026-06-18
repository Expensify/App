import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {useTableContext} from '@components/Table/TableContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

export default function TableFilterTrigger() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Filter']);
    const {filterConfig, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;

    if (!hasFiltersAvailable) {
        return null;
    }

    if (shouldUseNarrowTableLayout) {
        return (
            <PressableWithFeedback
                accessibilityLabel={translate('search.filtersHeader')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.TABLE.FILTERS}
                hoverStyle={styles.buttonHoveredBG}
                style={[styles.justifyContentCenter, styles.componentSizeNormal, styles.borderRadiusCircle]}
                onPress={() => {}}
            >
                <Icon
                    small
                    src={icons.Filter}
                    fill={theme.icon}
                />
            </PressableWithFeedback>
        );
    }

    return (
        <Button
            small
            text="Filters"
            icon={icons.Filter}
        />
    );
}
