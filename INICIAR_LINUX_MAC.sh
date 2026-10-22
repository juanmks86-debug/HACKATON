#!/usr/bin/env sh
cd "$(dirname "$0")/frontend" || exit 1
printf "Abrí http://localhost:5500 en tu navegador\n"
python3 -m http.server 5500
