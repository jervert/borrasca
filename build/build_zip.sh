#!/bin/bash

echo $(date)
echo 'Compression started'
datetimef=$(date +"%Y_%m_%d__%H_%M_%S")
location=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

7za a -tzip $location/../borrasca_next_$datetimef.zip $location/../app/* $location/../phonegap/* -x!*node_modules -x!*services -x!app.js -x!*.bat -x!*.7z -x!*.log -x!favicon.ico -x!favicon.png -x!package.json
echo 'Compression finished'