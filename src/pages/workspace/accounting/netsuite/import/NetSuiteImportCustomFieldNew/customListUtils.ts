import {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {NetSuiteCustomFieldForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

function getCustomListInitialSubstep(values: NetSuiteCustomFieldForm) {
    if (!values[INPUT_IDS.LIST_NAME]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER;
    }
    if (!values[INPUT_IDS.TRANSACTION_FIELD_ID]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.TRANSACTION_FIELD_ID;
    }
    if (!values[INPUT_IDS.MAPPING]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.MAPPING;
    }
    return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CONFIRM;
}

function getCustomSegmentInitialSubstep(values: NetSuiteCustomFieldForm) {
    if (!values[INPUT_IDS.SEGMENT_TYPE]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE;
    }
    if (!values[INPUT_IDS.SEGMENT_NAME]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_NAME;
    }
    if (!values[INPUT_IDS.INTERNAL_ID]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.INTERNAL_ID;
    }
    if (!values[INPUT_IDS.SCRIPT_ID]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SCRIPT_ID;
    }
    if (!values[INPUT_IDS.MAPPING]) {
        return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.MAPPING;
    }
    return CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.CONFIRM;
}

function getSubstepValues(NetSuitCustomFieldDraft: OnyxEntry<NetSuiteCustomFieldForm>): NetSuiteCustomFieldForm {
    return {
        [INPUT_IDS.LIST_NAME]: NetSuitCustomFieldDraft?.[INPUT_IDS.LIST_NAME] ?? '',
        [INPUT_IDS.TRANSACTION_FIELD_ID]: NetSuitCustomFieldDraft?.[INPUT_IDS.TRANSACTION_FIELD_ID] ?? '',
        [INPUT_IDS.MAPPING]: NetSuitCustomFieldDraft?.[INPUT_IDS.MAPPING] ?? '',
        [INPUT_IDS.INTERNAL_ID]: NetSuitCustomFieldDraft?.[INPUT_IDS.INTERNAL_ID] ?? '',
        [INPUT_IDS.SCRIPT_ID]: NetSuitCustomFieldDraft?.[INPUT_IDS.SCRIPT_ID] ?? '',
        [INPUT_IDS.SEGMENT_TYPE]: NetSuitCustomFieldDraft?.[INPUT_IDS.SEGMENT_TYPE] ?? '',
        [INPUT_IDS.SEGMENT_NAME]: NetSuitCustomFieldDraft?.[INPUT_IDS.SEGMENT_NAME] ?? '',
    };
}

export {getSubstepValues, getCustomListInitialSubstep, getCustomSegmentInitialSubstep};
