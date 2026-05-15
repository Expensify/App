import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceCounterProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;
};

function DistanceCounter({unit}: DistanceCounterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Crosshair']);
    const StyleUtils = useStyleUtils();

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const distance = DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails?.distanceInMeters ?? 0, unit).toFixed(1);

    return (
        <MenuItemWithTopDescription
            interactive={false}
            description={translate('common.distance')}
            titleComponent={
                <Text style={[styles.iouAmountTextInput, styles.textXLarge, styles.colorMuted, styles.ml3]}>
                    <Text style={[styles.iouAmountTextInput, styles.textXLarge]}>{distance}</Text>
                    {` ${unit}`}
                </Text>
            }
            style={[styles.ph0]}
            icon={icons.Crosshair}
            shouldIconUseAutoWidthStyle
            descriptionTextStyle={StyleUtils.getFontSizeStyle(variables.fontSizeLabel)}
        />
    );
}

export default DistanceCounter;
