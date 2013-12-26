<?php
// http://leafo.net/scssphp/
// https://github.com/leafo/scssphp

require "libs/scss.inc.php";

$scssDir = '../compass/sass/';
$scssSource = 'main.scss';
$scssFormat = 'scss_formatter_compressed'; // scss_formatter || scss_formatter_compressed

$scss = new scssc();
$scss->setFormatter($scssFormat);
$scss->setImportPaths($scssDir);

$scssCompiled = $scss->compile('@import "'.$scssSource.'"');

echo $scssCompiled;
?>