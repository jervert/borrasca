#!/bin/bash
datetimef=$(date +"%Y_%m_%d__%H_%M_%S")
location=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
workspace=~/adt_workspace/borrasca-next/www
zipFile=$location/borrasca_next_$datetimef.zip

7za a -tzip $zipFile $location/app/* $location/phonegap/* -x!*node_modules -x!*services -x!app.js -x!*.bat -x!*.7z -x!*.log -x!favicon.ico -x!favicon.png -x!package.json
echo 'Compression finished'
rm -rf  $workspace/*
echo 'www cleaned'
#7za e $zipFile -y -tzip o$workspace * -r
unzip $zipFile -d $workspace
echo 'File uncompressed'
rm $zipFile
echo 'File removed'
cd $workspace
phonegap local run android --device
echo 'Is the app installed on your device???'