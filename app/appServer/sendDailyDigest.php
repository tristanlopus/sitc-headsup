<?php
/**
 * This example shows settings to use when sending via Google's Gmail servers.
 */

//SMTP needs accurate times, and the PHP time zone MUST be set
//This should be done in your php.ini, but this is how to do it if you don't have access to that
date_default_timezone_set('America/Detroit');

require_once 'sitc_workforce_creds.php';

require_once __DIR__ . '/../../bower_components/phpmailer/PHPMailerAutoload.php';

// Filenames
$templateDir = "dailyDigestTemplates";
$introFilename = "$templateDir/introTemplate.html";
$headCountStaticFilename = "./$templateDir/headCountStaticTemplate.html";
$headCountDynamicFilename = "./$templateDir/headCountDynamicTemplate.html";
$countTotalFilename = "./$templateDir/countTotalTemplate.html";
$headsListStaticFilename = "./$templateDir/headsListStaticTemplate.html";
$headsListSiteHeaderFilename = "./$templateDir/headsListSiteHeaderTemplate.html";
$headsListDynamicFilename = "./$templateDir/headsListDynamicTemplate.html";
$endFilename = "./$templateDir/endTemplate.html";

//Create a new PHPMailer instance
$mail = new PHPMailer;

$connection = new mysqli($hostname, $username, $password, $database);
if ($connection->connect_error)
  die ($connection->connect_error);

$currentDate = date('Y/m/d');

echo $currentDate . "\n";

$query = "SELECT HeadsUp.carpoolSite_id, CarpoolSite.name, COUNT(HeadsUp.person_id) AS personCount, SUM(HeadsUp.headsUp_numSeatbelts) AS seatbeltCount FROM HeadsUp RIGHT JOIN CarpoolSite ON CarpoolSite.carpoolSite_id=HeadsUp.carpoolSite_id WHERE HeadsUp.forDate='$currentDate' AND (HeadsUp.isComing=1 OR HeadsUp.isComing='1') GROUP BY HeadsUp.carpoolSite_id";
$counts_result = $connection->query($query);
if ($connection->error) {
  die ($connection->error);
}

$counts = array();
$sites = array();
while ($currentSite = $counts_result->fetch_assoc()) {
  $counts[] = $currentSite;
  $sites[$currentSite['carpoolSite_id']] = array();
  // var_dump($currentSite);
}

var_dump($counts);
echo "\r\n";

$query = "SELECT Person.person_id, Person.firstName, Person.lastName, RegistrationInfo.phone, HeadsUp.carpoolSite_id, HeadsUp.headsUp_preferredProject, HeadsUp.headsUp_hasCar, HeadsUp.headsUp_numSeatbelts FROM HeadsUp LEFT JOIN Person ON HeadsUp.person_id=Person.person_id LEFT JOIN RegistrationInfo ON HeadsUp.person_id=RegistrationInfo.person_id WHERE HeadsUp.forDate='$currentDate' AND (HeadsUp.isComing=1 OR HeadsUp.isComing='1')";
$persons_result = $connection->query($query);
if ($connection->error) {
  die ($connection->error);
}

while ($currentPerson = $persons_result->fetch_assoc()) {
  $sites[$currentPerson['carpoolSite_id']][] = $currentPerson;
  // var_dump($currentSite);
}

var_dump($sites);

// -- Construct the email message
$messageText = '';

$introFile = fopen( $introFilename, "r" );
$introFilesize = filesize( $introFilename );
$messageText .= fread( $introFile, $introFilesize );

$headCountStaticFile = fopen( $headCountStaticFilename, "r" );
$headCountStaticFilesize = filesize( $headCountStaticFilename );
$messageText .= fread( $headCountStaticFile, $headCountStaticFilesize );

$headCountDynamicFile = fopen( $headCountDynamicFilename, "r" );
$headCountDynamicFilesize = filesize( $headCountDynamicFilename );
$headCountDynamicText .= fread( $headCountDynamicFile, $headCountDynamicFilesize );

$headCountDynamicInterpolated = '';
$totalHeadCount = 0;
$totalSeatbeltCount = 0;
foreach ($counts as $siteInfo) {
  $textToAdd = '';
  $textToAdd .= str_replace("{{siteName}}", $siteInfo['name'], $headCountDynamicText);
  $textToAdd = str_replace("{{headCount}}", $siteInfo['personCount'], $textToAdd);
  $textToAdd = str_replace("{{seatbelts}}", $siteInfo['seatbeltCount'], $textToAdd);
  $headCountDynamicInterpolated .= $textToAdd;

  // add to running totals
  $totalHeadCount += $siteInfo['personCount'];
  $totalSeatbeltCount += $siteInfo['seatbeltCount'];
}

$messageText .= $headCountDynamicInterpolated;

$countTotalFile = fopen( $countTotalFilename, "r" );
$countTotalFilesize = filesize( $countTotalFilename );
$countTotalText .= fread( $countTotalFile, $countTotalFilesize );
$countTotalInterpolated = str_replace("{{totalHeadCount}}", $totalHeadCount, $countTotalText);
$countTotalInterpolated = str_replace("{{totalSeatbeltCount}}", $totalSeatbeltCount, $countTotalInterpolated);
$messageText .= $countTotalInterpolated;

$headsListStaticFile = fopen( $headsListStaticFilename, "r" );
$headsListStaticFilesize = filesize( $headsListStaticFilename );
$messageText .= fread( $headsListStaticFile, $headsListStaticFilesize );

$headsListSiteHeaderFile = fopen( $headsListSiteHeaderFilename, "r" );
$headsListSiteHeaderFilesize = filesize( $headsListSiteHeaderFilename );
$headsListSiteHeaderText = fread( $headsListSiteHeaderFile, $headsListSiteHeaderFilesize );

$headsListDynamicFile = fopen( $headsListDynamicFilename, "r" );
$headsListDynamicFilesize = filesize( $headsListDynamicFilename );
$headsListDynamicText = fread( $headsListDynamicFile, $headsListDynamicFilesize );


$textToAddToMessage = '';
foreach ($counts as $siteInfo) {
  $currentSite = $siteInfo['carpoolSite_id'];
  $textForCurrentSite = str_replace("{{siteName}}", $siteInfo['name'], $headsListSiteHeaderText);

  foreach ($sites[$currentSite] as $personInfo) {
    $name = $personInfo['firstName'] . " " . $personInfo['lastName'];
    $rawPhone = $personInfo['phone'];
    $phone = substr($rawPhone, 0, 3) . "-" . substr($rawPhone, 3, 3) . "-" . substr($rawPhone, 6);
    $seatbelts = ($personInfo['headsUp_numSeatbelts'] > 0) ? $personInfo['headsUp_numSeatbelts'] : '';

    $textToAdd = str_replace("{{personName}}", $name, $headsListDynamicText);
    $textToAdd = str_replace("{{personNumSeatbelts}}", $seatbelts, $textToAdd);
    $textToAdd = str_replace("{{personPhone}}", $phone, $textToAdd);

    if ($personInfo['headsUp_hasCar'] == 1 || $personInfo['headsUp_hasCar'] == '1') {
      $imgText = '<img src="images/drive_eta.png"  height="24px" width="24px" style="opacity: 0.55" />';
      $textToAdd = str_replace("{{driverImage}}", $imgText, $textToAdd);
    } else {
      $textToAdd = str_replace("{{driverImage}}", '', $textToAdd);
    }

    $textForCurrentSite .= $textToAdd;

  }

  $textToAddToMessage .= $textForCurrentSite;
}
$messageText .= $textToAddToMessage;

$

$endFile = fopen( $endFilename, "r" );
$endFilesize = filesize( $endFilename );
$messageText .= fread( $endFile, $endFilesize );

echo $messageText;







/*
//Tell PHPMailer to use SMTP
$mail->isSMTP();

//Enable SMTP debugging
// 0 = off (for production use)
// 1 = client messages
// 2 = client and server messages
$mail->SMTPDebug = 2;

//Ask for HTML-friendly debug output
$mail->Debugoutput = 'html';

//Set the hostname of the mail server
$mail->Host = 'smtp.gmail.com';
// use
// $mail->Host = gethostbyname('smtp.gmail.com');
// if your network does not support SMTP over IPv6

//Set the SMTP port number - 587 for authenticated TLS, a.k.a. RFC4409 SMTP submission
$mail->Port = 587;

//Set the encryption system to use - ssl (deprecated) or tls
$mail->SMTPSecure = 'tls';

//Whether to use SMTP authentication
$mail->SMTPAuth = true;

//Username to use for SMTP authentication - use full email address for gmail
$mail->Username = "webmaster@summerinthecity.com";

//Password to use for SMTP authentication
$mail->Password = "sitc+2-0*0/2";

//Set who the message is to be sent from
$mail->setFrom('tech@summerinthecity.com', 'SITC Registration');

// //Set an alternative reply-to address
// $mail->addReplyTo('replyto@example.com', 'First Last');

//Set who the message is to be sent to
foreach ($directorEmails as $sendToEmail => $sendToName) {
  $mail->addAddress($sendToEmail, $sendToName);
}
// $mail->addAddress('ben@summerinthecity.com', 'Ben');

//Set the subject line
$mail->Subject = "New car-endowed volunteer: $firstName $lastName";

$message = '<html><body>';
$message .= "<h3 style='padding-bottom:0px'>$firstName $lastName just registered, and they said they can drive.</h3>";
$message .= "<h4>Follow up with them to seal the deal!</h4>";
$message .= "<strong>Here's their info:</strong><br />";
$message .= "<strong>Email: </strong>$email<br />";
$message .= "<strong>Phone: </strong>$phone<br />";
$message .= "<strong>High School: </strong>$highSchool, class of $hsGradYear<br />";
$message .= "<strong>Carpool Site: </strong>$carpoolSite<br />";
if ($firstTimeTeer == 1 || $firstTimeTeer == '1') {
  $message .= "<strong>Rookie: </strong>This is $firstName's <strong>first time</strong> volunteering, so be sure to give an extra warm and explanatory welcome.<br />";
}
else {
  $message .= "<strong>Veteran: </strong>$firstName <strong>has</strong> volunteered with us before, so don't worry about re-hashing the basics with them<br />";
}
$message .= "<h4>Have a wonderful day.</h4><br />";
$message .= "<span>All our love,</span><br />";
$message .= "<span>Tristan & Tristn</span>";
$message .= '</html></body>';

$mail->msgHTML($message);

//send the message, check for errors
if (!$mail->send()) {
    echo "Mailer Error: " . $mail->ErrorInfo;
} else {
    echo "Message sent!";
}
*/

?>


 <?php
   function sanitize($var) {
     $clean_var = filter_var($var, FILTER_SANITIZE_STRING);
     return $clean_var;
   }
 ?>
