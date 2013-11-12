<?php
include('config.php');

$geolocation = explode(',', $_GET['geolocation']);

$text = file_get_contents('http://api.openweathermap.org/data/2.5/weather?lat='.$geolocation[0].'&lon='.$geolocation[1].'&units=metric&mode=json&lang='.$_GET['lang'].'&APPID='.$config['openweathermaps_apikey']);
header("Content-type: text/json");
echo '{"now": '.$text.'}';
?>