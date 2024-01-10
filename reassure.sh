set -e
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}
git fetch origin "$BASELINE_BRANCH" --no-tags --depth=1
git switch "$BASELINE_BRANCH"
npm install --force
npx reassure --baseline
git switch --force --detach -
git merge --no-commit --allow-unrelated-histories "$BASELINE_BRANCH" -X ours
npm install --force
npx reassure --branch