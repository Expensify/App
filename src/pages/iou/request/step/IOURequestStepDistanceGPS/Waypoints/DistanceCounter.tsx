import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getEffectiveDistance} from '@libs/GPSDraftDetailsUtils';
import {formatDistanceToParts} from '@libs/NumberFormatUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceCounterProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;
};

function DistanceCounter({unit}: DistanceCounterProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Crosshair']);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const distanceParts = formatDistanceToParts(preferredLocale, DistanceRequestUtils.convertDistanceUnit(getEffectiveDistance(gpsDraftDetails), unit), unit);

    return (
        <MenuItem.Root>
            <MenuItem.Row>
                <MenuItem.Leading>
                    <MenuItem.IconNarrow src={icons.Crosshair} />
                </MenuItem.Leading>
                <MenuItemField.Content name={translate('common.distance')}>
                    <Text style={[styles.iouAmountTextInput, styles.textXLarge]}>
                        {distanceParts.map((part) =>
                            part.type === 'unit' ? (
                                <Text
                                    key="unit"
                                    style={[styles.iouAmountTextInput, styles.textXLarge, styles.colorMuted]}
                                >
                                    {part.value}
                                </Text>
                            ) : (
                                part.value
                            ),
                        )}
                    </Text>
                </MenuItemField.Content>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default DistanceCounter;
