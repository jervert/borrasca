<?php

class DataBorrasca {
	
	public $openweathermapsApiKey = null;
	public $language = 'en';
	public $dataOrigin = 'real';
	public $geolocation = null;
	public $timezone = 'Europe/Madrid';
	public $location = 'en';
  public $resultLimit = 10;
  private $openweathermapUrl = 'http://api.openweathermap.org/data/2.5/weather';
  private $aemetXmlUrl = 'http://www.aemet.es/xml/municipios/localidad_';
  private $weirdCharacters = array('á', 'é', 'í', 'ó', 'ú', 'ü', 'à', 'è', 'ì', 'ò', 'ù', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü', 'À', 'È', 'Ì', 'Ò', 'Ù');
  private $safeCharacters =  array('a', 'e', 'i', 'o', 'u', 'u', 'a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u', 'u', 'a', 'e', 'i', 'o', 'u');
	
	public function pageNowAndHere () {
		$text = file_get_contents($this->openweathermapUrl.'?lat='.$this->geolocation[0].'&lon='.$this->geolocation[1].'&units=metric&mode=json&lang='.$this->language.'&APPID='.$this->openweathermapsApiKey);
		return '{"now": '.$text.'}';
	}
	
	public function pageDetail () {
		$data = array();
		$data['hour'] = $this->dateAfterTimezoneOffset('G', $this->timezone);
		$data['day'] = $this->dateAfterTimezoneOffset('j', $this->timezone);

		$data['now'] = json_decode(file_get_contents($this->openweathermapUrl.'?q='.$this->location.',es&units=metric&mode=json&lang='.$this->language.'&APPID='.$this->openweathermapsApiKey));
		
		return json_encode($data);
	}
	public function pageSearch () {
    $searched = $this->location;

    // SQLITE CONNECT
    $data = array();
    try  {
      $db = new PDO("sqlite:../../data/locations.sqlite");

      $result = $db->query("SELECT id_region, id_location, name_location FROM locations WHERE name_location LIKE '%".$searched."%' LIMIT ".$this->resultLimit);

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

    return json_encode($data);
  }
  
  public function locationsGeolocate () {
    //http://es.scribd.com/doc/2569355/Geo-Distance-Search-with-MySQL
    $url = 'http://nominatim.openstreetmap.org/search?city=@CITY@&country=Spain&format=jsonv2';
  }
  
  public function makeLocationsSearchable () {
    $pattern = "/, (las|los|el|la|a|o|l'|els|les)$/";
    try  {
    $db = new PDO("sqlite:../data/locations.sqlite");
    $result = $db->query("SELECT * FROM locations WHERE name_searchable IS NULL LIMIT 100");
    if (count($result) > 0) {
      foreach ($result as $row) {
        $searchable_location = strtolower($row['name_location']);
        if (preg_match($pattern, strtolower($row['name_location']), $matches)) {
          $fragments = explode(', ', $searchable_location);
          $searchable_location = $fragments[1].' '.$fragments[0];
        }
        $searchable_location = str_replace($this->weirdCharacters, $this->safeCharacters, $searchable_location);
        $db->query("UPDATE locations SET name_searchable='".$searchable_location."' WHERE id_region='".$row['id_region']."' AND	id_location='".$row['id_location']."'");
        echo '<p>'.$row['name_location'].' ----> '.$searchable_location.'</p>';
      }
    }
    } catch(PDOException $e) {
      echo $e->getMessage();
    }
  }
  
  public function xmlAemet () {
    $text = file_get_contents($this->aemetXmlUrl.$this->location.'.xml');
    return $text;
  }
	
	
	private function getTimezoneOffset($remote_tz, $origin_tz = null) {
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

	private function dateAfterTimezoneOffset($dateString, $location) {
		$offset = $this->getTimezoneOffset($location);
		$offset_time = time() - $offset;
		$dateList = getDate($offset_time);
		$mkDate = mktime($dateList['hours'], $dateList['minutes'], $dateList['seconds'], $dateList['mon'], $dateList['mday'], $dateList['year']);
		return date($dateString, $mkDate);
	}
}

?>