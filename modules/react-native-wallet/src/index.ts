import ApplePushProvisioningModule from './ApplePushProvisioning';
import GooglePushProvisioningModule from './GooglePushProvisioning';

const PushProvisioning = {
    Apple: ApplePushProvisioningModule,
    Google: GooglePushProvisioningModule,
};

export default PushProvisioning;
