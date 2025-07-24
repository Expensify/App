import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchFilterPageFooterButtonsProps = {
    /** Function to reset changes made in the filter */
    resetChanges: () => void;

    /** Function to apply changes made in the filter */
    applyChanges: () => void;
};

function SearchFilterPageFooterButtons({resetChanges, applyChanges}: SearchFilterPageFooterButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View>
            <Button
                large
                style={[styles.mt3]}
                text={translate('common.reset')}
                onPress={resetChanges}
            />
            <Button
                large
                success
                pressOnEnter
                style={[styles.mt3]}
                text={translate('common.save')}
                onPress={applyChanges}
            />
        </View>
    );
}

export default SearchFilterPageFooterButtons;
