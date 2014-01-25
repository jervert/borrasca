<?php
header("Content-type: text/json");

$path = '../../php/';
include($path.'config.php');
include($path.'function.header.php');
include($path.'class.dataBorrasca.php');


$borrasca = new DataBorrasca();
$borrasca->location = $_GET['location_name'];
$borrasca->language = $_GET['lang'];
$borrasca->dataOrigin = $config['data_origin'];
$borrasca->timezone = $config['timezone'];
$borrasca->openweathermapsApiKey = $config['openweathermaps_apikey'];
echo $borrasca->pageDetail();


?>