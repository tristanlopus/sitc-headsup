<?php

  require_once 'sitc_workforce_creds.php';

  $connection = new mysqli($hostname, $username, $password, $database);
  if ($connection->connect_error)
    die ($connection->connect_error);

  $query = "SELECT summerStartDate, summerEndDate FROM SessionVals";
  $dates_result = $connection->query($query);
  if ($connection->error) {
    die ($connection->error);
  }

  $dates = array();
  while ($row = $dates_result->fetch_assoc()) {
    $dates['summerStartDate'] = $row['summerStartDate'];
    $dates['summerEndDate'] = $row['summerEndDate'];
  }

  echo json_encode($dates);

 ?>

 <?php
   function sanitize($var) {
     $clean_var = filter_var($var, FILTER_SANITIZE_STRING);
     return $clean_var;
   }
 ?>
