<?php
$text = file_get_contents('http://www.aemet.es/xml/municipios/localidad_'.$_GET['location_id'].'.xml');
  /*$page_file = fopen($config['file_page'], 'w+');
    $date_file = fopen($config['file_date'], 'w+');

    fwrite($date_file, $modified_date);
    fclose($date_file);

  fwrite($page_file, str_replace($original, $new, $text));
  fclose($page_file);*/
header("Content-type: text/xml");
echo $text;
?>