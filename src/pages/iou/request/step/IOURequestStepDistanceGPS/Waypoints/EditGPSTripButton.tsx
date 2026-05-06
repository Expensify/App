import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isTripStopped as isTripStoppedUtil} from '@src/libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditGPSTripButtonProps = MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.GPS_TRIP_EDIT];

function EditGPSTripButton({action, iouType, transactionID, reportID, backToReport}: EditGPSTripButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil']);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    if (!isTripStopped) {
        return null;
    }

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('gps.edit')}
            accessibilityRole="button"
            onPress={() => Navigation.navigate(ROUTES.GPS_TRIP_EDIT.getRoute(action, iouType, transactionID, reportID, backToReport))}
            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_EDIT_BUTTON}
        >
            <View style={styles.primaryMediumIcon}>
                <Icon
                    fill={theme.icon}
                    src={icons.Pencil}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

export default EditGPSTripButton;
