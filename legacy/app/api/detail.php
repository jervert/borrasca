<?php

function get_timezone_offset($remote_tz, $origin_tz = null) {
  if($origin_tz === null) {
     if(!is_string($origin_tz = date_default_timezone_get())) {
         return false; // A UTC timestamp was returned -- bail out!
     }
  }
  $origin_dtz = new DateTimeZone($origin_tz);
  $remote_dtz = new DateTimeZone($remote_tz);
  $origin_dt = new DateTime("now", $origin_dtz);
  $remote_dt = new DateTime("now", $remote_dtz);
  $offset = $origin_dtz->getOffset($origin_dt) - $remote_dtz->getOffset($remote_dt);
  return $offset;
}

function date_after_timezone_offset($dateString, $location) {
  $offset = get_timezone_offset($location);
  $offset_time = time() - $offset;
  $dateList = getDate($offset_time);
  $mkDate = mktime($dateList['hours'], $dateList['minutes'], $dateList['seconds'], $dateList['mon'], $dateList['mday'], $dateList['year']);
  return date($dateString, $mkDate);
}

$data = array();

$data['hour'] = date_after_timezone_offset('G', 'Europe/Madrid');
$data['day'] = date_after_timezone_offset('j', 'Europe/Madrid');

header("Content-type: text/json");
echo json_encode($data);

?>