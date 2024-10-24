export default function getPolicyDomainName(policyID: string): string {
    return `expensify-policy${policyID}.exfy`;
}
