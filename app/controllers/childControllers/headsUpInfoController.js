var app = angular.module('headsUpApp')

var dates_initial = {};
var existingDates = {};

app.controller('HeadsUpInfoController', ['$scope', '$log', '$q', '$state', '$stateParams', 'getCarpoolSites', 'submitHeadsUp', 'getExistingDates', 'getStartEndDates', function($scope, $log, $q, $state, $stateParams, getCarpoolSites, submitHeadsUp, getExistingDates, getStartEndDates) {
  $log.log('Hello, world! HeadsUpInfoController is running!')

  if ($stateParams.myPerson) {
    $scope.person = $stateParams.myPerson
  }

  $scope.genInfo = {}
  $scope.headsUpDays = []
  getCarpoolSites().then(function success (sites) {
    console.log(sites);
    $scope.carpoolSites = sites
  })
  $scope.detailsAreShowing = [false, false, false]


  var startEndDates_defer = $q.defer()
  getStartEndDates().then(function (dates) {
    console.log(dates);
    $scope.fixedDates = dates;
    $log.log("Summer start date, raw: " + $scope.fixedDates.summerStart['Date']);
    // transform the date from UTC to local
    // Since these dates come with a default time of 00:00 UTC, when they are used to initialize date objects on clients with negative UTC offsets, they result in date objects for the day before the day actually intended.
    var startDate = new Date($scope.fixedDates.summerStart['Date']);
    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
    $scope.fixedDates.summerStart['jsDate'] = startDate;
    console.log("Summer start month: " + $scope.fixedDates.summerStart.jsDate.getMonth());
    console.log("Summer start year: " + $scope.fixedDates.summerStart.jsDate.getFullYear());

    // transform the date from UTC to local
    var endDate = new Date($scope.fixedDates.summerEnd['Date']);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
    $scope.fixedDates.summerEnd['jsDate'] = endDate;

    $scope.fixedDates.dayOffNotes = {};
    $scope.fixedDates.daysOff.forEach(function (dayOff) {
      var jsDate = new Date(dayOff['Date']);
      jsDate.setMinutes(jsDate.getMinutes() + jsDate.getTimezoneOffset(0));
      dayOff['jsDate'] = jsDate;

      var dateString = `${jsDate.getFullYear()}-${((jsDate.getMonth() + 1) < 10) ? '0' : ''}${jsDate.getMonth() + 1}-${(jsDate.getDate() < 10) ? '0' : ''}${jsDate.getDate()}`;
      dayOff['dateString'] = dateString;
      $scope.fixedDates.dayOffNotes[dateString] = dayOff["HeadsUp Note"];
    });
    console.log($scope.fixedDates.dayOffNotes["2019-07-04"]);

    startEndDates_defer.resolve()
  }, function (error) {
    startEndDates_defer.resolve()
  })

  var existingDates_defer = $q.defer();
  startEndDates_defer.promise.then(function () {
    getExistingDates($scope.person["RecordID"]).then(function (existingDatesResponse) {
      var existingDatesObj = {};
      existingDatesResponse.forEach(function (date) {
        existingDatesObj[date["Date"]] = date;
      })
      existingDates = existingDatesObj;
      existingDates_defer.resolve();
    })
  })

  existingDates_defer.promise.then(function () {
    var NUM_DAYS_IN_ONE_WEEK = 7;
    var PROJECT_DAYS_PER_WEEK = 4;
    var OFF_DAYS_PER_WEEK = NUM_DAYS_IN_ONE_WEEK - PROJECT_DAYS_PER_WEEK;
    var weeks = [];
    var dates = {};
    var iteratingDate = $scope.fixedDates.summerStart.jsDate;
    console.log("start date: " + iteratingDate.getDay());
    // var currentWeek = 0;
    var disableDates = $scope.fixedDates.daysOff.map(function (dateObj) {
      return dateObj.dateString;
    })
    while (iteratingDate < $scope.fixedDates.summerEnd.jsDate) {
      weeks.push(new Array());
      for (var k = 0; k < PROJECT_DAYS_PER_WEEK; k++) {
        var myDateString = `${iteratingDate.getFullYear()}-${((iteratingDate.getMonth() + 1) < 10) ? '0' : ''}${iteratingDate.getMonth() + 1}-${(iteratingDate.getDate() < 10) ? '0' : ''}${iteratingDate.getDate()}`;
        weeks[weeks.length - 1].push(myDateString);

        var myIsComing = false;
        var myPreferredProject = null;
        var myCarpoolSite = null;
        var myHasCar = null;
        var myNumPassengers = null;

        if (existingDates[myDateString]) {
          myIsComing = true;

          var myExistingDate = existingDates[myDateString];

          if (myExistingDate["Project Preference"]) {
            myPreferredProject = myExistingDate["Project Preference"]
          }
          if (myExistingDate["Carpool Site"]) {
            myCarpoolSite = myExistingDate["Carpool Site"][0]
          }
          if (myExistingDate["Can Drive"]) {
            myHasCar = myExistingDate["Can Drive"]
          }
          if (myExistingDate["Passengers"]) {
            myNumPassengers = myExistingDate["Passengers"]
          }
        }
      
        console.log(myDateString + ": " + !disableDates.includes(myDateString));
        
        dates[myDateString] = {
          date: new Date(iteratingDate),
          dateString: myDateString,
          year: iteratingDate.getFullYear(),
          month: iteratingDate.getMonth(),
          date: parseInt(((iteratingDate.getDate() < 10) ? '0' : '') + iteratingDate.getDate()),
          day: iteratingDate.getDay(),
          isComing: myIsComing,
          preferredProject: myPreferredProject,
          carpoolSite: myCarpoolSite,
          hasCar: myHasCar,
          numPassengers: myNumPassengers,
          enabled: ((iteratingDate >= $scope.fixedDates.summerStart.jsDate) && (iteratingDate <= $scope.fixedDates.summerEnd.jsDate) && !disableDates.includes(myDateString))
        };
        iteratingDate.setDate(iteratingDate.getDate() + 1);
      }
      iteratingDate.setDate(iteratingDate.getDate() + 3);
    }
    console.log(weeks);
    console.log(dates);
    $scope.weeks = weeks;
    $scope.dates = dates;
    Object.keys(dates).forEach(function (dateString) {
      dates_initial[dateString] = Object.assign({}, dates[dateString]);
    })
  })

  $scope.submit = function () {
    var modifiedDates = [];

    console.log($scope.dates);
    console.log(dates_initial);

    Object.keys($scope.dates).forEach(function (dateString) {
      if (!objsAreEquivalent($scope.dates[dateString], dates_initial[dateString])) {
        modifiedDates.push($scope.dates[dateString]);
      }
    });

    console.log(modifiedDates);

    submitHeadsUp($scope.person["PersonID"], modifiedDates, existingDates).then(function (response) {
      $log.log("Response from submitHeadsUp: " + dump(response, 'none'))
      $state.go('headsUp.confirm')
    }, function failure (error) {
      console.log(error);
      $log.log("submitHeadsUp failed!: " + dump(error, 'none'))
    })
  }

  $scope.setDaysInfo = function (param) {
    angular.forEach(Object.keys($scope.dates), function (dateString) {
      if ($scope.dates[dateString].enabled) {
        $scope.dates[dateString][param] = $scope.genInfo[param];
      }
    })
  }

  $scope.backToId = function () {
    $state.go('headsUp.id')
  }

  $scope.months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

  $scope.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  $scope.projects = [
    {id: 'Play', name: 'Youth Enrichment'},
    {id: 'Hands-On', name:'Hands On'},
    {id: 'No Preference', name: "I'm Flexible"}
  ]

}])

function objsAreEquivalent(obj1, obj2) {
  if (Object.keys(obj1).length != Object.keys(obj2).length) {
    return false;
  }

  return Object.keys(obj1).every(function (key) {
    return obj1[key] === obj2[key]
  });
}
