# `regexpu-core` patches

### [regexpu-core+6.4.0+001+fix-lone-surrogate-class-strips-emoji.patch](regexpu-core+6.4.0+001+fix-lone-surrogate-class-strips-emoji.patch)

- Reason: Fixes a 6.x regression where a character class mixing lone surrogates (`\p{Cs}`) with astral code points (`\p{Co}`/`\p{Cn}`) is mis-transpiled when the `u` flag is removed (Hermes/metro), dropping regenerate's lone-surrogate guard so it matches the halves of valid surrogate pairs and strips emoji. The patch falls back to the guarded `bmpOnly: false` output when lone surrogates are present. Surfaced via `StringUtils.removeInvisibleCharacters`/`isEmptyString` after extending the emoji list to Unicode 15.1–17.0.

- Upstream PR/issue: https://github.com/mathiasbynens/regexpu-core/issues/112
- E/App issue: N/A
- PR introducing patch: https://github.com/Expensify/App/pull/93595
