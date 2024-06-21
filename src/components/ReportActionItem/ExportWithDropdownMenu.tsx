import React from 'react';
import type {ValueOf} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ExportWithDropdownMenuProps = {
    dropdownOptions: Array<DropdownOption<any>>;

    integrationName: ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;
};

function ExportWithDropdownMenu({dropdownOptions, integrationName}: ExportWithDropdownMenuProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <ButtonWithDropdownMenu
            success
            pressOnEnter
            shouldAlwaysShowDropdownMenu
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            onPress={() => {}}
            onOptionSelected={() => {
                // do logic with API calls depending on the option, "export" or "markAsExported"
            }}
            options={dropdownOptions}
            customText={translate('workspace.common.exportIntegrationSelected', {integrationName})}
            style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
        />
    );
}

export default ExportWithDropdownMenu;
