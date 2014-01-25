<?php
header("Content-type: text/json");
$path = '../../php/';
include($path.'config.php');
include($path.'function.header.php');
include($path.'class.dataBorrasca.php');

$borrasca = new DataBorrasca();
$borrasca->resultLimit = $config['result_limit'];
$borrasca->location = $_REQUEST['location_name'];
echo $borrasca->pageSearch();

?>