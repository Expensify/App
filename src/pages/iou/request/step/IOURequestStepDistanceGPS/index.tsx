import React from 'react';
import {Linking, View} from 'react-native';
import Button from '@components/Button';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import type IOURequestStepDistanceGPSProps from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IOURequestStepDistanceGPS(props: IOURequestStepDistanceGPSProps) {
    const {asset: ToddInCar} = useMemoizedLazyAsset(() => loadIllustration('ToddInCar'));
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.ph5, styles.pv10, styles.alignItemsCenter, styles.justifyContentCenter, styles.h100]}>
            <View style={[styles.gpsWebIllustrationContainer]}>
                <ImageSVG
                    src={ToddInCar}
                    contentFit="contain"
                />
            </View>
            <View style={[styles.gap2, styles.pb5, styles.pt2]}>
                <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>{translate('gps.desktop.title')}</Text>
                <Text style={[styles.textAlignCenter, styles.textSupportingNormal]}>{translate('gps.desktop.subtitle')}</Text>
            </View>

            <Button
                text={translate('gps.desktop.button')}
                onPress={() => Linking.openURL(CONST.EXPENSIFY_MOBILE_URL)}
                success
            />
        </View>
    );
}

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
