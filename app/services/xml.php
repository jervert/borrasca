<?php
$path = '../../php/';
include($path.'config.php');
include($path.'class.dataBorrasca.php');

$text = file_get_contents('http://www.aemet.es/xml/municipios/localidad_'.$_GET['location_id'].'.xml');
header("Content-type: text/xml");
echo $text;
?>