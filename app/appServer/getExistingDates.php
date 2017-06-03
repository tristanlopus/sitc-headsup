<?php

  require_once 'sitc_workforce_creds.php';

  $connection = new mysqli($hostname, $username, $password, $database);
  if ($connection->connect_error)
    die ($connection->connect_error);

  $person_id = (isset($_GET['person_id'])) ? sanitize($_GET['person_id']) : '';
  $rawDates = (isset($_GET['dates'])) ? json_decode($_GET['dates']) : null;

  $datesForQuery = [];
  foreach ($rawDates as $date) {
    array_push($datesForQuery, "'$date'");
  }

  $datesString = implode(', ', $datesForQuery);

  $query = "SELECT forDate, isComing, carpoolSite_id, headsUp_preferredProject, headsUp_hasCar, headsUp_numSeatbelts FROM HeadsUp WHERE forDate IN ($datesString) AND person_id=$person_id";
  // echo $query;
  $dates_result = $connection->query($query);
  if ($connection->error) {
    die ($connection->error);
  }

  $dates = array();
  while ($date = $dates_result->fetch_assoc()) {
    array_push($dates, $date);
  }

  echo json_encode($dates);

 ?>

 <?php
   function sanitize($var) {
     $clean_var = filter_var($var, FILTER_SANITIZE_STRING);
     return $clean_var;
   }
 ?>
