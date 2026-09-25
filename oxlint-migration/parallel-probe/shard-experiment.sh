#!/bin/bash
# oxlint runs JS plugins on one thread, so --threads does nothing for them. This probe fans files
# across several `oxlint --threads=1` processes instead. See the plan doc for what each subcommand shows:
#   ./shard-experiment.sh measure [N]   baseline vs N contiguous shards
#   ./shard-experiment.sh curve         scaling curve over several N
#   ./shard-experiment.sh verify  [N]   shards vs a single run, per-rule diff
# macOS ships bash 3.2, so empty array expansions must be guarded.
set -u
REPO=/Users/lukasz.modzelewski/conductor/workspaces/expensify-app/kyoto
cd "$REPO" || exit 1
LIST=/tmp/oxfiles.txt

file_list() { npx oxlint --debug=files . 2>/dev/null | sort > "$LIST"; }

split_contiguous() {
    local N="$1" SD="$2" TOTAL LINES
    TOTAL=$(wc -l < "$LIST" | tr -d ' ')
    rm -rf "$SD"; mkdir -p "$SD"
    LINES=$(( (TOTAL + N - 1) / N ))
    split -l "$LINES" -d -a 2 "$LIST" "$SD/s_"
}

run_shards() {
    local N="$1" SD="$2"; shift 2
    local EXTRA=() ; for a in "$@"; do EXTRA+=("$a"); done
    local START END
    START=$(date +%s.%N)
    for s in "$SD"/s_*; do
        ( npx oxlint --threads=1 ${EXTRA[@]+"${EXTRA[@]}"} $(cat "$s") >/dev/null 2>&1 ) &
    done
    wait
    END=$(date +%s.%N)
    echo "$END-$START" | bc
}

time_baseline() {
    local S E; S=$(date +%s.%N)
    npx oxlint . >/dev/null 2>&1 || true
    E=$(date +%s.%N); echo "$E-$S" | bc
}

case "${1:-measure}" in
    measure)
        N="${2:-6}"; file_list
        echo "baseline (default threads, 1 proc): $(time_baseline)s"
        split_contiguous "$N" /tmp/oxshards
        echo "N=$N contiguous shards (threads=1 each): $(run_shards "$N" /tmp/oxshards)s"
        ;;
    curve)
        file_list
        echo "baseline: $(time_baseline)s"
        for N in 1 3 4 6 7 14; do
            if [ "$N" -eq 1 ]; then
                S=$(date +%s.%N); npx oxlint --threads=1 . >/dev/null 2>&1 || true; E=$(date +%s.%N)
                printf 'N=1 (threads=1) %.1fs\n' "$(echo "$E-$S"|bc)"; continue
            fi
            split_contiguous "$N" /tmp/oxshards
            printf 'N=%s %.1fs\n' "$N" "$(run_shards "$N" /tmp/oxshards)"
        done
        ;;
    verify)
        N="${2:-6}"; file_list
        echo "single run -> /tmp/single.json"
        npx oxlint --format json . >/tmp/single.json 2>/dev/null || true
        SD=/tmp/oxjson; rm -rf "$SD"; mkdir -p "$SD"
        split_contiguous "$N" "$SD"
        for s in "$SD"/s_*; do ( npx oxlint --threads=1 --format json $(cat "$s") >"$s.json" 2>/dev/null ) & done; wait
        node -e '
        const fs=require("fs");
        const strip=t=>t.replace(/^[^{]*/,"").replace(/[^}]*$/,"");
        const single=JSON.parse(strip(fs.readFileSync("/tmp/single.json","utf8")));
        let merged=[];
        for(const f of fs.readdirSync("/tmp/oxjson").filter(x=>x.endsWith(".json")))
            merged.push(...JSON.parse(strip(fs.readFileSync("/tmp/oxjson/"+f,"utf8"))).diagnostics);
        const byCode=a=>{const m={};for(const d of a){const k=d.code||"(none)";m[k]=(m[k]||0)+1;}return m;};
        const A=byCode(single.diagnostics),B=byCode(merged);
        let diffs=0; for(const k of new Set([...Object.keys(A),...Object.keys(B)])) if((A[k]||0)!==(B[k]||0)){diffs++;console.log(`  ${k}: single=${A[k]||0} sharded=${B[k]||0}`);}
        console.log(`TOTAL single=${single.diagnostics.length} sharded=${merged.length} per-rule-diffs=${diffs}`);
        '
        ;;
    *) echo "unknown subcommand: $1"; exit 2 ;;
esac
