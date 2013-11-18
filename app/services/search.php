<?php
$path = '../../php/';
include($path.'config.php');
include($path.'class.dataBorrasca.php');

$searched = $_REQUEST['location_name'];
if (isset($_REQUEST['limit'])) {
  $limit = $_REQUEST['limit'];
} else {
  $limit = 10;
}

// SQLITE CONNECT
$data = array();
try  {
  $db = new PDO("sqlite:../../data/locations.sqlite");

  $result = $db->query("SELECT id_region, id_location, name_location FROM locations WHERE name_location LIKE '%".$searched."%' LIMIT ".$limit);

  $data['result'] = 'OK';
  $data['searched'] = $searched;
  if (count($result) > 0 and strlen($searched) > 0) {
    $data['result_message'] = 'Results fetched';
    $data['locations'] = array();
    $i = 0;
    foreach ($result as $row) {
      $data['locations'][$i] = Array();
      $data['locations'][$i]['name'] = $row['name_location'];
      $data['locations'][$i]['link'] = $row['id_region'].$row['id_location'];
	    $i++;
	  }
  } else {
    $data['result_message'] = 'No results';
    $data['locations'] = null;
  }
} catch(PDOException $e) {
  echo $e->getMessage();
  $data['result'] = 'ERROR';
  $data['result_message'] = 'Database not loaded successfully';
}



header("Content-type: text/json");
echo json_encode($data);

?>