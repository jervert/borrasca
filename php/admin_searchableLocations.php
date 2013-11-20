<?php
include('config.php');
include('class.dataBorrasca.php');

$borrasca = new DataBorrasca();
$borrasca->makeLocationsSearchable();
?>