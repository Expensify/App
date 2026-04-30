import React from 'react';
import ButtonWithDropdownMenuV2 from '@components/ButtonWithDropdownMenu/v2';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

const story = {
    title: 'Components/ButtonWithDropdownMenuV2',
    component: ButtonWithDropdownMenuV2,
};

const noop = () => {};

function Split() {
    const icons = useMemoizedLazyExpensifyIcons(['Wallet', 'CheckCircle']);
    return (
        <ButtonWithDropdownMenuV2>
            <ButtonWithDropdownMenuV2.PrimaryButton
                pressOnEnter
                onPress={noop}
            >
                Pay $123.45
            </ButtonWithDropdownMenuV2.PrimaryButton>
            <ButtonWithDropdownMenuV2.Caret />
            <ButtonWithDropdownMenuV2.Menu>
                <ButtonWithDropdownMenuV2.Option
                    text="Pay with Wallet"
                    icon={icons.Wallet}
                    onSelected={noop}
                />
                <ButtonWithDropdownMenuV2.Option
                    text="Pay elsewhere"
                    icon={icons.CheckCircle}
                    onSelected={noop}
                />
            </ButtonWithDropdownMenuV2.Menu>
        </ButtonWithDropdownMenuV2>
    );
}

function SingleTrigger() {
    const icons = useMemoizedLazyExpensifyIcons(['Wallet', 'Building', 'CheckCircle']);
    return (
        <ButtonWithDropdownMenuV2>
            <ButtonWithDropdownMenuV2.Trigger text="More" />
            <ButtonWithDropdownMenuV2.Menu>
                <ButtonWithDropdownMenuV2.Option
                    text="Pay with Wallet"
                    icon={icons.Wallet}
                    onSelected={noop}
                />
                <ButtonWithDropdownMenuV2.Option
                    text="Business bank account"
                    icon={icons.Building}
                    description="...0123"
                    onSelected={noop}
                />
                <ButtonWithDropdownMenuV2.Option
                    text="Pay elsewhere"
                    icon={icons.CheckCircle}
                    onSelected={noop}
                />
            </ButtonWithDropdownMenuV2.Menu>
        </ButtonWithDropdownMenuV2>
    );
}

function WithSubmenus() {
    const icons = useMemoizedLazyExpensifyIcons(['User', 'Building', 'Bank', 'CheckCircle']);
    return (
        <ButtonWithDropdownMenuV2>
            <ButtonWithDropdownMenuV2.Trigger text="Pay invoice" />
            <ButtonWithDropdownMenuV2.Menu headerText="Choose payment method">
                <ButtonWithDropdownMenuV2.Submenu
                    text="Pay as individual"
                    backButtonText="Individual"
                    icon={icons.User}
                >
                    <ButtonWithDropdownMenuV2.Option
                        text="Personal bank ...4567"
                        icon={icons.Bank}
                        onSelected={noop}
                    />
                    <ButtonWithDropdownMenuV2.Option
                        text="Pay elsewhere"
                        icon={icons.CheckCircle}
                        onSelected={noop}
                    />
                </ButtonWithDropdownMenuV2.Submenu>
                <ButtonWithDropdownMenuV2.Submenu
                    text="Pay as business"
                    backButtonText="Business"
                    icon={icons.Building}
                >
                    <ButtonWithDropdownMenuV2.Option
                        text="Business bank ...8901"
                        icon={icons.Bank}
                        onSelected={noop}
                    />
                    <ButtonWithDropdownMenuV2.Option
                        text="Pay elsewhere"
                        icon={icons.CheckCircle}
                        onSelected={noop}
                    />
                </ButtonWithDropdownMenuV2.Submenu>
            </ButtonWithDropdownMenuV2.Menu>
        </ButtonWithDropdownMenuV2>
    );
}

export default story;
export {Split, SingleTrigger, WithSubmenus};
