import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';

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
                    <View style={[styles.p5, styles.flexGrow1, styles.justifyContentEnd]}>
                        <Button
                            success
                            style={[styles.w100]}
                            onPress={onNext}
                            large
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
