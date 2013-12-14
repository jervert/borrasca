@echo off

set appName=Borrasca-Next
set appId=com.phonegap.borrasca_v2
set workspace=%ADT_WORKSPACE%/borrasca-next


call phonegap create %workspace% -n $appName -i $appId
echo Created app
call %letterDrive%
cd %workspace%
echo Moved to %workspace%
call cordova platform add android
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-splashscreen.git
echo Downloaded plugins