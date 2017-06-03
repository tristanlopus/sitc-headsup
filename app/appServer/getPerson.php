<?php

  require_once 'sitc_workforce_creds.php';

  $connection = new mysqli($hostname, $username, $password, $database);
  if ($connection->connect_error)
    die ($connection->connect_error);

  $email = (isset($_GET['email'])) ? sanitize($_GET['email']) : '';

  $query = "SELECT p.person_id, p.firstName, p.lastName, r.email, r.phone FROM Person p, RegistrationInfo r WHERE p.person_id=r.person_id AND r.email='$email'";
  // echo $query;
  $persons_result = $connection->query($query);
  if ($connection->error) {
    die ($connection->error);
  }

  $persons = array();
  while ($currentPerson = $persons_result->fetch_assoc()) {
    $persons[] = $currentPerson;
  }

  echo json_encode($persons);

 ?>

 <?php
   function sanitize($var) {
     $clean_var = filter_var($var, FILTER_SANITIZE_STRING);
     return $clean_var;
   }
 ?>
