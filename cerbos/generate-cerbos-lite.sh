#!/usr/bin/env bash
#
# Copyright 2021-2022 Zenauth Ltd.

set -euo pipefail

if [[ $# -lt 2 || -z "$1" || -z "$2" ]]; then
    echo "Usage: $0 <path to store> <destDir>"
    exit 2
fi

STORE=`readlink -f "$1"`    # path to policy store
DEST_DIR=`readlink -f "$2"` # directory will contain the produced "policy.wasm" file

shift 2

echo "Zip up policies"
zip -q -r tmp_bundle.zip ${STORE}

echo "Submitting bundle for generation..."
curl -s -F zip=@tmp_bundle.zip --output ${DEST_DIR}/policy.wasm https://lite-ea.cerbos.cloud/
echo "Bundle generated"
rm tmp_bundle.zip