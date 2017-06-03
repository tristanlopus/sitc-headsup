<?php

require_once '../app/appServer/sitc_workforce_creds.php';

$connection = new mysqli($hostname, $username, $password, $database);
if ($connection->connect_error)
  die ($connection->connect_error);

  $person_id = (isset($_GET['person_id'])) ? $_GET['person_id'] : '';
  $date1 = $_GET['date1'];
  $date2 = $_GET['date2'];
  $date3 = $_GET['date3'];

  $dates = [];
  array_push($dates, "'$date1'", "'$date2'", "'$date3'");

  $datesString = implode(', ', $dates);

  $query = "SELECT forDate, isComing, carpoolSite_id, headsUp_preferredProject, headsUp_hasCar, headsUp_numSeatbelts FROM HeadsUp WHERE forDate IN ($datesString) AND person_id=$person_id";
  echo $query;
  $persons_result = $connection->query($query);
  if ($connection->error) {
    die ($connection->error);
  }

  while ($row = $persons_result->fetch_array()) {
    echo var_dump($row);
  }

?>
