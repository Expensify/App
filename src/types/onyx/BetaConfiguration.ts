import type Beta from './Beta';

/** A configuration for different types of betas. For example there is a list of 'explicitOnly' betas. */
type BetaConfiguration = Record<string, Beta[]>;

export default BetaConfiguration;
