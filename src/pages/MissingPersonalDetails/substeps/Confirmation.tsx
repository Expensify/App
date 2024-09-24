import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import {getSubstepValues} from '@pages/MissingPersonalDetails/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const PERSONAL_DETAILS_STEP_INDEXES = CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING;

function Confirmation({privatePersonalDetails, onNext, onMove}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [draftValues, formMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    const values = getSubstepValues(privatePersonalDetails, draftValues);

    const isLoading = isLoadingOnyxValue(formMetadata);

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
                        title={`${values[INPUT_IDS.LEGAL_FIRST_NAME].trim()} ${values[INPUT_IDS.LEGAL_LAST_NAME].trim()}`}
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
                        title={`${values[INPUT_IDS.ADDRESS_LINE_1].trim()}, ${values[INPUT_IDS.ADDRESS_LINE_2].trim() ? `${values[INPUT_IDS.ADDRESS_LINE_2].trim()}, ` : ''}${values[
                            INPUT_IDS.CITY
                        ].trim()}, ${values[INPUT_IDS.STATE].trim()}, ${values[INPUT_IDS.ZIP_POST_CODE].trim().toUpperCase()}, ${values[INPUT_IDS.COUNTRY]}`}
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
                            isLoading={isLoading}
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

Confirmation.displayName = 'ConfirmationStep';

export default Confirmation;
