import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const PERSONAL_DETAILS_STEP_INDEXES = CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING;

function ConfirmationStep({personalDetailsValues: values, onNext, onMove}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('personalInfoStep.letsDoubleCheck')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('personalInfoStep.legalName')}
                        title={`${values[INPUT_IDS.LEGAL_FIRST_NAME]} ${values[INPUT_IDS.LEGAL_LAST_NAME]}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_DETAILS_STEP_INDEXES.LEGAL_NAME);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.dob')}
                        title={values[INPUT_IDS.DATE_OF_BIRTH]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_DETAILS_STEP_INDEXES.DATE_OF_BIRTH);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('personalInfoStep.address')}
                        title={`${values[INPUT_IDS.ADDRESS_LINE_1]}, ${values[INPUT_IDS.ADDRESS_LINE_2] ? `${values[INPUT_IDS.ADDRESS_LINE_2]}, ` : ''}${values[INPUT_IDS.CITY]}, ${
                            values[INPUT_IDS.STATE]
                        }, ${values[INPUT_IDS.ZIP_POST_CODE].toUpperCase()}, ${values[INPUT_IDS.COUNTRY]}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_DETAILS_STEP_INDEXES.ADDRESS);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.phoneNumber')}
                        title={values[INPUT_IDS.PHONE_NUMBER]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_DETAILS_STEP_INDEXES.PHONE_NUMBER);
                        }}
                    />
                    <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                        <Button
                            isDisabled={isOffline}
                            success
                            large
                            style={[styles.w100]}
                            onPress={onNext}
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
