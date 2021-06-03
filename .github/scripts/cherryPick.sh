echo "Attempting to cherry-pick $1"

CP_SUCCESS=false
if [[ "$(git cherry-pick -x --mainline 1 "$1")" ]]; then
  echo "No conflicts!"
  CP_SUCCESS=true
else
  echo "There are conflicts in the following files:"
  git --no-pager diff --name-only --diff-filter=U

  # Just add the unresolved conflicts and continue
  git add .
  GIT_MERGE_AUTOEDIT=no git cherry-pick --continue
fi

if [[ "$CP_SUCCESS" = true ]]; then
  exit 0
else
  exit 1
fi
