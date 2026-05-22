const { expect } = require('chai');
const sinon = require('sinon');

describe('reproduce_issue_91269', () => {
    let isValidPhoneNumber;
    let isValidUSPhone;

    beforeEach(() => {
        isValidPhoneNumber = sinon.stub().returns(true);
        isValidUSPhone = sinon.stub().returns(false);

        // Mock the parsePhoneNumber function to return a valid phone number with region code 'CA'
        const parsePhoneNumberStub = sinon.stub(require('libphonenumber-js'), 'parsePhoneNumber').callsFake((phoneNumber) => ({
            countryCode: '+1',
            nationalNumber: phoneNumber,
            regionCode: 'CA',
        }));
    });

    afterEach(() => {
        isValidPhoneNumber.restore();
        isValidUSPhone.restore();
        parsePhoneNumberStub.restore();
    });

    it('should accept Canadian phone numbers', () => {
        const phoneNumberWithCountryCode = '+1234567890';
        const e164FormattedPhoneNumber = '1234567890';

        PhoneNumberStep.validatePhoneNumber(phoneNumberWithCountryCode, e164FormattedPhoneNumber, isValidPhoneNumber, isValidUSPhone);

        expect(isValidPhoneNumber.calledOnce).to.be.true;
        expect(isValidUSPhone.calledOnce).to.be.false;
    });

    it('should reject US phone numbers', () => {
        const phoneNumberWithCountryCode = '+1234567890';
        const e164FormattedPhoneNumber = '1234567890';

        PhoneNumberStep.validatePhoneNumber(phoneNumberWithCountryCode, e164FormattedPhoneNumber, isValidPhoneNumber, isValidUSPhone);

        expect(isValidPhoneNumber.calledOnce).to.be.true;
        expect(isValidUSPhone.calledOnce).to.be.true;
    });
});