import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {Option} from '@libs/searchOptions';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {CONST as COMMON_CONST} from 'expensify-common';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useState} from 'react';

import StateSelectorModal from './StateSelectorModal';

type State = keyof typeof COMMON_CONST.STATES;

type StatePickerProps = ForwardedFSClassProps & {
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;
};

function StatePicker({value, errorText, onInputChange = () => {}, forwardedFSClass}: StatePickerProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: Option) => {
        onInputChange?.(item.value);
        hidePickerModal();
    };

    return (
        <>
            <MenuItem.Root
                onPress={callIfAuthenticated(() => setIsPickerVisible(true), session)}
                sentryLabel={CONST.SENTRY_LABEL.STATE_PICKER.OPEN}
            >
                <MenuItemField.Row
                    name={translate('common.state')}
                    value={value ? translate(`allStates.${value as State}.stateName`) : undefined}
                    forwardedFSClass={forwardedFSClass}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                    />
                )}
            </MenuItem.Root>
            <StateSelectorModal
                isVisible={isPickerVisible}
                currentState={value ?? ''}
                onStateSelected={updateInput}
                onClose={hidePickerModal}
                label={translate('common.state')}
                onBackdropPress={hidePickerModal}
            />
        </>
    );
}

export default StatePicker;
