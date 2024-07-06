import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import CustomListPicker from './CustomListPicker';

type SubStepWithPolicy = SubStepProps & {policyID: string; policy: Policy};

function AddCustomRecordStep({onNext, screenIndex, policy}: SubStepWithPolicy) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const customLists = policy?.connections?.netsuite?.options?.data?.customLists ?? [];

    return (
        <View style={styles.flex1}>
            <CustomListPicker
                allCustomLists={customLists}
                selectedCustomList=""
                onSubmit={(selectedCustomList) => {
                    console.log('selectedCustomList', selectedCustomList);
                }}
            />
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.next')}
                />
            </FixedFooter>
        </View>
    );
}

AddCustomRecordStep.displayName = 'AddCustomRecordStep';
export default AddCustomRecordStep;
export type {SubStepWithPolicy};
