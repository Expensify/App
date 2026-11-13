import useNetwork from '@hooks/useNetwork';

import type {ButtonProps} from '..';

import Button from '..';

function ButtonDisabledWhenOffline({children, isDisabled, ...props}: ButtonProps) {
    const {isOffline} = useNetwork();
    return (
        <Button
            {...props}
            isDisabled={isOffline || isDisabled}
        >
            {children}
        </Button>
    );
}
export default ButtonDisabledWhenOffline;
