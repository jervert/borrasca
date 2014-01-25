<?php
header("Content-type: text/xml");
$path = '../../php/';
include($path.'config.php');
include($path.'function.header.php');
include($path.'class.dataBorrasca.php');

$borrasca = new DataBorrasca();
$borrasca->dataOrigin = $config['data_origin'];
$borrasca->location = $_GET['location_id'];
echo $borrasca->xmlAemet();
?>