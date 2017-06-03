<?php

  require_once 'sitc_workforce_creds.php';

  $connection = new mysqli($hostname, $username, $password, $database);
  if ($connection->connect_error)
    die ($connection->connect_error);

  if (isset($_GET['person_id']) && isset($_GET['headsUpData'])) {
    $person_id = $_GET['person_id'];
    $headsUpData = json_decode($_GET['headsUpData'], true);
    $genCarpoolSite = (isset($_GET['genCarpoolSite'])) ? $_GET['genCarpoolSite'] : 'NULL';
    $genPreferredProject = (isset($_GET['genPreferredProject'])) ? $_GET['genPreferredProject'] : 'NULL';
  }
  else {
    http_response_code(420);
    die("Data parameters not set.");
  }

  $query = "SELECT forDate FROM HeadsUp WHERE person_id=$person_id";
  $existingDates_result = $connection->query($query);

  $existingDates = [];
  while ($date = $existingDates_result->fetch_row()) {
    array_push($existingDates, $date[0]);
  }

  echo var_dump($existingDates);

  $values = [];
  $updateClauses = [];
  foreach ($headsUpData as $day) {
    if ($day['isComing'] || array_search($day['dateString'], $existingDates) > -1) {
      $dateString = (isset($day['dateString'])) ? $day['dateString'] : 'NULL';
      $isComing = ($day['isComing'] == 1 || $day['isComing'] == '1') ? 1 : 0;
      $carpoolSite = (isset($day['carpoolSite']) && $day['carpoolSite'] != null) ? $day['carpoolSite'] : $genCarpoolSite;
      $preferredProject = (isset($day['preferredProject']) && $day['preferredProject'] != null) ? $day['preferredProject'] : $genPreferredProject;
      $hasCar = (isset($day['hasCar']) && $day['hasCar']) ? $day['hasCar'] : 0;
      $numSeatbelts = (isset($day['numSeatbelts'])) ? $day['numSeatbelts'] : 0;
      $pushString = "($person_id, '$dateString', $isComing, '$carpoolSite', '$preferredProject', $hasCar, $numSeatbelts)";
      array_push($values, $pushString);
    }
  }

  $valuesString = implode(', ', $values);

  $query = "INSERT INTO HeadsUp (person_id, forDate, isComing, carpoolSite_id, headsUp_preferredProject, headsUp_hasCar, headsUp_numSeatbelts) VALUES $valuesString ON DUPLICATE KEY UPDATE person_id=VALUES(person_id), forDate=VALUES(forDate), isComing=VALUES(isComing), carpoolSite_id=VALUES(carpoolSite_id), headsUp_preferredProject=VALUES(headsUp_preferredProject), headsUp_hasCar=VALUES(headsUp_hasCar), headsUp_numSeatbelts=VALUES(headsUp_numSeatbelts)";
  echo $query;

  $persons_result = $connection->query($query);
  if ($connection->error) {
    die ($connection->error);
  }
  else {
    echo "success!";
  }

 ?>

 <?php
   function sanitize($var) {
     $clean_var = filter_var($var, FILTER_SANITIZE_STRING);
     return $clean_var;
   }
 ?>
