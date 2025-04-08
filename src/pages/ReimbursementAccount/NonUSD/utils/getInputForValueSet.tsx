import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import type {ThemeStyles} from '@src/styles';
import type {CorpayFormField} from '@src/types/onyx';
import mapToPushRowWithModalListOptions from './mapToPushRowWithModalListOptions';

function getInputForValueSet(field: CorpayFormField, defaultValue: string, isEditing: boolean, styles: ThemeStyles) {
    return (
        <View
            style={[styles.mb6, styles.mhn5]}
            key={field.id}
        >
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={field.valueSet ? mapToPushRowWithModalListOptions(field.valueSet) : {}}
                description={field.label}
                shouldSaveDraft={!isEditing}
                defaultValue={String(defaultValue) ?? ''}
                modalHeaderTitle={field.label}
                searchInputTitle={field.label}
                inputID={field.id}
            />
        </View>
    );
}

export default getInputForValueSet;
