@echo off
echo %DATE%
echo %TIME%
set datetimef=%date:~-4%_%date:~3,2%_%date:~0,2%__%time:~0,2%_%time:~3,2%_%time:~6,2%
echo %datetimef%
SET location=%CD%

call %location%\..\bin\7zip\7za.exe a -tzip %location%\..\borrasca_next_%datetimef%.zip %location%\..\app\* %location%\..\phonegap\* -x!*node_modules -x!*services -x!app.js -x!*.bat -x!*.7z -x!*.log -x!favicon.ico -x!favicon.png -x!package.json