#!/bin/bash
appName=Borrasca-Next
appId=com.phonegap.borrasca_v2
workspace=~/adt_workspace/borrasca-next

mkdir $workspace
cd $workspace
phonegap create $workspace -n $appName -i $appId
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-splashscreen.git