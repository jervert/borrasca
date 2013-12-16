@echo off

set APPNAME=Borrasca-Next
set APPID=com.phonegap.borrasca_v2
set ADT_WORKSPACE=C:\WEB\WORKSPACE
set WORKSPACE=%ADT_WORKSPACE%/borrasca-next


call phonegap create %WORKSPACE% -n %APPNAME% -i %APPID%
echo Created app
cd %WORKSPACE%
echo Moved to %WORKSPACE%
call cordova platform add android
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
call cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-splashscreen.git
echo Downloaded plugins