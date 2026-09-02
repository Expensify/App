import useNetwork from '@hooks/useNetwork';

import type {ButtonProps} from '..';

import Button from '..';

function ButtonDisabledWhenOffline({...props}: ButtonProps) {
    const {isOffline} = useNetwork();
    return (
        <Button
            {...props}
            isDisabled={isOffline}
        />
    );
}
export default ButtonDisabledWhenOffline;
