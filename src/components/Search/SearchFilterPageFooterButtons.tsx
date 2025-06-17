import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
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
        <FixedFooter style={styles.mtAuto}>
            <Button
                large
                style={[styles.mt4]}
                text={translate('common.reset')}
                onPress={resetChanges}
            />
            <Button
                large
                success
                pressOnEnter
                style={[styles.mt4]}
                text={translate('common.save')}
                onPress={applyChanges}
            />
        </FixedFooter>
    );
}

export default SearchFilterPageFooterButtons;
