<?php

class DataBorrasca {
	
	public $openweathermapsApiKey = null;
	public $language = 'en';
	public $dataOrigin = 'real';
	public $geolocation = null;
	public $timezone = 'Europe/Madrid';
	public $location = 'en';
	
	public function pageNowAndHere () {
		$text = file_get_contents('http://api.openweathermap.org/data/2.5/weather?lat='.$this->geolocation[0].'&lon='.$this->geolocation[1].'&units=metric&mode=json&lang='.$this->language.'&APPID='.$this->openweathermapsApiKey);
		return '{"now": '.$text.'}';
	}
	
	public function pageDetail () {
		$data = array();
		$data['hour'] = $this->dateAfterTimezoneOffset('G', $this->timezone);
		$data['day'] = $this->dateAfterTimezoneOffset('j', $this->timezone);

		$data['now'] = json_decode(file_get_contents('http://api.openweathermap.org/data/2.5/weather?q='.$this->location.',es&units=metric&mode=json&lang='.$this->language.'&APPID='.$this->openweathermapsApiKey));
		
		return json_encode($data);
	}
	public function pageSearch () {}
	
	
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