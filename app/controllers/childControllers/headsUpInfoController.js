var app = angular.module('headsUpApp')

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
    $scope.dates = dates;
    $log.log("Summer start date, raw: " + $scope.dates.summerStart['Date']);
    // transform the date from UTC to local
    // Since these dates come with a default time of 00:00 UTC, when they are used to initialize date objects on clients with negative UTC offsets, they result in date objects for the day before the day actually intended.
    var startDate = new Date($scope.dates.summerStart['Date']);
    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
    $scope.dates.summerStart['jsDate'] = startDate;
    console.log("Summer start month: " + $scope.dates.summerStart.jsDate.getMonth());
    console.log("Summer start year: " + $scope.dates.summerStart.jsDate.getFullYear());

    // transform the date from UTC to local
    var endDate = new Date($scope.dates.summerEnd['Date']);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
    $scope.dates.summerEnd['jsDate'] = endDate;

    $scope.dates.daysOff.forEach(function (dayOff) {
      var jsDate = new Date(dayOff['Date']);
      dayOff['jsDate'] = jsDate;
    });

    startEndDates_defer.resolve()
  }, function (error) {
    startEndDates_defer.resolve()
  })

  var existingDates_defer = $q.defer();
  startEndDates_defer.promise.then(function () {
    getExistingDates($scope.person["Record ID"]).then(function (existingDates) {
      $scope.existingDates = existingDates;
      existingDates_defer.resolve();
    })
  })

  existingDates_defer.promise.then(function () {
    var NUM_DAYS_IN_ONE_WEEK = 7;
    var PROJECT_DAYS_PER_WEEK = 4;
    var OFF_DAYS_PER_WEEK = NUM_DAYS_IN_ONE_WEEK - PROJECT_DAYS_PER_WEEK;
    var weeks = [];
    var iteratingDate = $scope.dates.summerStart.jsDate;
    console.log("start date: " + iteratingDate.getDay());
    var currentWeek = 0;
    while (iteratingDate < $scope.dates.summerEnd.jsDate) {
      weeks.push(new Array());
      for (var k = 0; k < PROJECT_DAYS_PER_WEEK; k++) {
        var myDateString = `${iteratingDate.getFullYear()}-${((iteratingDate.getMonth() + 1) < 10) ? '0' : ''}${iteratingDate.getMonth() + 1}-${(iteratingDate.getDate() < 10) ? '0' : ''}${iteratingDate.getDate()}`;
        weeks[currentWeek].push({
          date: new Date(iteratingDate),
          dateString: myDateString,
          year: iteratingDate.getFullYear(),
          month: iteratingDate.getMonth(),
          date: parseInt(((iteratingDate.getDate() < 10) ? '0' : '') + iteratingDate.getDate()),
          day: iteratingDate.getDay(),
          isComing: false,
          preferredProject: null,
          carpoolSite: null,
          hasCar: null,
          numSeatbelts: null,
          enable: ((iteratingDate >= $scope.dates.summerStart.jsDate) && (iteratingDate <= $scope.dates.summerEnd.jsDates))
        });
        iteratingDate.setDate(iteratingDate.getDate() + 1);
      }
      iteratingDate.setDate(iteratingDate.getDate() + 3);
      currentWeek++;
    }
    console.log(weeks);
    $scope.weeks = $scope.weeks_initial = weeks;
  })

  $scope.submit = function () {
    var arrayToPass = $scope.weeks[0].concat($scope.weeks[1])
    if ($scope.weeks[2]) {
      $log.log("Passing weeks[2]")
      arrayToPass = arrayToPass.concat($scope.weeks[2])
    }
    submitHeadsUp($scope.person.person_id, arrayToPass, $scope.genInfo.carpoolSite, $scope.genInfo.preferredProject).then(function (response) {
      $log.log("Response from submitHeadsUp: " + dump(response, 'none'))
      $state.go('headsUp.confirm')
    }, function failure (error) {
      $log.log("submitHeadsUp failed!: " + dump(error, 'none'))
    })
  }

  $scope.setDaysInfo = function (param) {
    angular.forEach($scope.weeks, function (week) {
      angular.forEach(week, function(day) {
        if (day.enabled) {
          day[param] = $scope.genInfo[param]
        }
      })
    })
  }

  $scope.disabledDates

  $scope.backToId = function () {
    $state.go('headsUp.id')
  }

  $scope.months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

  $scope.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  $scope.projects = [
    {id: 'play', name: 'Youth Enrichment'},
    {id: 'handsOn', name:'Hands On'},
    {id: 'all', name: "I'm Flexible"}
  ]

}])
