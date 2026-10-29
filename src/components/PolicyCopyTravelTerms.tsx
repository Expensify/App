import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import CheckboxWithLabel from './CheckboxWithLabel';
import RenderHTML from './RenderHTML';

type PolicyCopyTravelTermsProps = {isChecked: boolean; onToggle: () => void};

function PolicyCopyTravelTerms({isChecked, onToggle}: PolicyCopyTravelTermsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <>
            <View style={[styles.renderHTML, styles.flexRow, styles.mb3]}>
                <RenderHTML html={translate('travel.termsAndConditions.subtitle')} />
            </View>
            <CheckboxWithLabel
                style={styles.mb3}
                accessibilityLabel={translate('travel.termsAndConditions.label')}
                isChecked={isChecked}
                onInputChange={onToggle}
                label={translate('travel.termsAndConditions.label')}
            />
        </>
    );
}

export default PolicyCopyTravelTerms;
