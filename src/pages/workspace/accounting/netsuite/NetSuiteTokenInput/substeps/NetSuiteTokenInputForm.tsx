import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import type { SubStepProps } from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';

function NetSuiteTokenInputForm({onNext, screenIndex}: SubStepProps) {
const styles = useThemeStyles();
const {translate} = useLocalize();
  return (
    <View>
      <Text>Form {screenIndex}</Text>
      <Button
                    success
                    large
                    style={[styles.w100, styles.mv5]}
                    onPress={onNext}
                    text={translate('common.confirm')}
                />
    </View>
  )
}

NetSuiteTokenInputForm.displayName = 'NetSuiteTokenInputForm';
export default NetSuiteTokenInputForm;