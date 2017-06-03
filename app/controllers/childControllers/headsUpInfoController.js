var app = angular.module('headsUpApp')

app.controller('HeadsUpInfoController', ['$scope', '$log', '$q', '$state', '$stateParams', 'getCarpoolSites', 'submitHeadsUp', 'getExistingDates', function($scope, $log, $q, $state, $stateParams, getCarpoolSites, submitHeadsUp, getExistingDates) {
  $log.log('Hello, world! HeadsUpInfoController is running!')

  if ($stateParams.myPerson) {
    $scope.person = $stateParams.myPerson
  }

  $scope.genInfo = {}
  $scope.headsUpDays = []
  getCarpoolSites().then(function success (sites) {
    $scope.carpoolSites = sites
  })
  $scope.detailsAreShowing = [false, false, false]

  // find out the dates of the next 2 week's worth of project days, as well as the current week's
  var today = new Date()
  var showCurrentWeek = false
  if (today.getDay() == 2) {
    showCurrentWeek = true
  }
  else if (today.getDay() > 2 && today.getDay() < 6) {
    // go backwards until we hit the first Tuesday
    do {
      today.setDate(today.getDate() - 1)
    } while (today.getDay() != 2)

    // as long as it's not Friday after 8 a.m., show the current week
    if (!(today.getDay() == 5 && today.getHours() > 8)) {
      showCurrentWeek = true
    }
  }
  else {
    // go forward until we hit the first Tuesday
    do {
      today.setDate(today.getDate() + 1)
    } while (today.getDay() != 2)
  }

  var firstProjectDay = today
  $scope.weeks = []
  var dates = {} // array of all the dates, used later in getExistingDates().then()
  var loopStop = (showCurrentWeek) ? 3 : 2
  var defer = $q.defer()
  for (var k = 0; k < loopStop; k++) {
    // week is an array of day objects
    var week = []
    for (var i = 0; i < 4; i++) {
      var myDate = new Date(firstProjectDay)
      myDate.setDate(myDate.getDate() + i)
      var myDateString = `${myDate.getFullYear()}-${((myDate.getMonth()+1) < 10) ? '0' : ''}${myDate.getMonth()+1}-${(myDate.getDate() < 10) ? '0' : ''}${myDate.getDate()}`
      dates[myDateString] = {
        indexInWeeks: k,
        indexInWeek: i
      }
      week.push({
        date: new Date(myDate),
        dateString: myDateString,
        year: myDate.getFullYear(),
        month: myDate.getMonth() + 1,
        date: parseInt(((myDate.getDate() < 10) ? '0':'') + myDate.getDate()),
        day: myDate.getDay(),
        isComing: false,
        preferredProject: null,
        carpoolSite: null,
        hasCar: null,
        numSeatbelts: null
      })
    }
    firstProjectDay.setDate(firstProjectDay.getDate() + 7)
    $log.log("Setting firstProjectDay to " + firstProjectDay.toLocaleDateString() + " with day of the week " + firstProjectDay.getDay())
    $scope.weeks.push(week)

    if (k == (loopStop - 1)) {
      defer.resolve()
    }
  }

  $log.log("Weeks: " + dump($scope.weeks, 'none'))

  defer.promise.then(function () {
    getExistingDates($scope.person.person_id, Object.keys(dates)).then(function (existingDates) {
      if (existingDates && existingDates.length > 0) {
        $log.log("Existing Dates: " + dump(existingDates, 'none'))
        $scope.genInfo.carpoolSite = existingDates[0].carpoolSite_id
        $scope.genInfo.preferredProject = existingDates[0].headsUp_preferredProject
        angular.forEach(existingDates, function(dateInfo) {
          $scope.weeks[dates[dateInfo.forDate].indexInWeeks][dates[dateInfo.forDate].indexInWeek].isComing = (parseInt(dateInfo.isComing)) ? true : false
          $scope.weeks[dates[dateInfo.forDate].indexInWeeks][dates[dateInfo.forDate].indexInWeek].carpoolSite = dateInfo.carpoolSite_id
          $scope.weeks[dates[dateInfo.forDate].indexInWeeks][dates[dateInfo.forDate].indexInWeek].preferredProject = dateInfo.headsUp_preferredProject
          $scope.weeks[dates[dateInfo.forDate].indexInWeeks][dates[dateInfo.forDate].indexInWeek].hasCar = (parseInt(dateInfo.headsUp_hasCar)) ? true : false
          $scope.weeks[dates[dateInfo.forDate].indexInWeeks][dates[dateInfo.forDate].indexInWeek].numSeatbelts = parseInt(dateInfo.headsUp_numSeatbelts)
        })
      }
    })
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
        day[param] = $scope.genInfo[param]
      })
    })
  }



  $scope.backToId = function () {
    $state.go('headsUp.id')
  }

  $scope.months = ['Jan', 'Feb', 'March', 'April', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

  $scope.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  $scope.projects = [
    {id: 'paint', name: 'Paint'},
    {id: 'plant', name: 'Plant'},
    {id: 'play', name: 'Play'}
  ]

}])
