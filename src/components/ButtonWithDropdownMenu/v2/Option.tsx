import type {DropdownOptionV2Props} from './types';
import {useRegisterOption} from './useRegisterOption';

function Option(props: DropdownOptionV2Props): null {
    useRegisterOption(props);
    return null;
}

Option.displayName = 'ButtonWithDropdownMenuV2.Option';

export default Option;
