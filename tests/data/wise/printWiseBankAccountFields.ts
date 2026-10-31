/* Prints the schema the adapter builds for one fetched currency: bun tests/data/wise/printWiseBankAccountFields.ts GBP [GB] */
import WISE_ACCOUNT_REQUIREMENTS from './accountRequirements';
import toWiseBankAccountFields from './toWiseBankAccountFields';

type FetchedCurrency = keyof typeof WISE_ACCOUNT_REQUIREMENTS;

const isFetchedCurrency = (currency: string): currency is FetchedCurrency => currency in WISE_ACCOUNT_REQUIREMENTS;

const [currency = 'GBP', country = currency.slice(0, 2)] = process.argv.slice(2);
const requirements = isFetchedCurrency(currency) ? WISE_ACCOUNT_REQUIREMENTS[currency] : undefined;

if (!requirements) {
    console.error(`No fetched requirements for ${currency}. Known: ${Object.keys(WISE_ACCOUNT_REQUIREMENTS).join(', ')}`);
    process.exit(1);
}

console.log(`Wise offers: ${requirements.map((requirement) => `${requirement.type} (${requirement.title})`).join(', ')}`);
console.log(JSON.stringify(toWiseBankAccountFields(country, currency, requirements), null, 2));
