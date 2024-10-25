import React, {useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import PushRowWithModal from '@components/PushRowWithModal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function Confirmation({onNext}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedCountry, setSelectedCountry] = useState<string>('');

    const handleSelectingCountry = (country: string) => {
        setSelectedCountry(country);
    };

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <FormProvider
                        formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                        submitButtonText={translate('common.confirm')}
                        onSubmit={onNext}
                        style={[styles.flexGrow1]}
                        submitButtonStyles={[styles.mh5, styles.pb0, styles.mbn1]}
                    >
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('countryStep.confirmBusinessBank')}</Text>
                        {/* This is only to showcase usage of PushRowWithModal component. The actual implementation will come in next issue - https://github.com/Expensify/App/issues/50897 */}
                        <PushRowWithModal
                            optionsList={CONST.ALL_COUNTRIES}
                            selectedOption={selectedCountry}
                            onOptionChange={handleSelectingCountry}
                            description={translate('common.country')}
                            modalHeaderTitle="Select country"
                            searchInputTitle="Find country"
                        />
                    </FormProvider>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
