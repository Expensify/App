import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

function Confirmation({onNext}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
                    </FormProvider>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
