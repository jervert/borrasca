<?php
header("Content-type: text/json");

$path = '../../php/';
include($path.'config.php');
include($path.'function.header.php');
include($path.'class.dataBorrasca.php');


$borrasca = new DataBorrasca();
$borrasca->language = $_GET['lang'];
$borrasca->dataOrigin = $config['data_origin'];
$borrasca->geolocation = explode(',', $_GET['geolocation']);
$borrasca->openweathermapsApiKey = $config['openweathermaps_apikey'];
echo $borrasca->pageNowAndHere();

?>