import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import type {ThemeStyles} from '@src/styles';
import type {CorpayFormField} from '@src/types/onyx';

type ValueToMap = {
    code?: string;
    id?: string;
    text?: string;
};

function mapToPushRowWithModalListOptions(values: ValueToMap[]): Record<string, string> {
    return values.reduce(
        (acc, curr) => {
            if (curr.code && curr.text) {
                acc[curr.code] = Str.recapitalize(curr.text);
            }
            return acc;
        },
        {} as Record<string, string>,
    );
}

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
