app.factory('getCarpoolSites', ['$log', '$q', '$http', function($log, $q, $http) {

  return function() {
    $log.log('getCarpoolSites ran!')
    var defer = $q.defer()

     $http({
      url: "app/appServer/getCarpoolSites.php",
      method: "GET"
    }).then(
      function(response) {
        defer.resolve(response.data)
      },
      function(error) {
        //TODO error handling
      })

    return defer.promise
  }
}])

app.factory('getPerson', ['$log', '$q', '$http', function($log, $q, $http) {

  return function (withEmail) {
    $log.log('getPerson ran!')
    var defer = $q.defer()

     $http({
      url: "app/appServer/getPerson.php",
      method: "GET",
      params: {
        'email': withEmail
      }
    }).then(
      function(response) {
        if (response.data.length > 0) {
          defer.resolve(response.data)
        } else {
          defer.reject()
        }
      },
      function(error) {
        //TODO error handling
      })

    return defer.promise
  }
}])

app.factory('getExistingDates', ['$log', '$q', '$http', function($log, $q, $http) {

  return function (withPersonId, forDates) {
    var defer = $q.defer()

    $http({
      method: 'GET',
      url: 'app/appServer/getExistingDates.php',
      params: {
        person_id: withPersonId,
        dates: JSON.stringify(forDates)
      }
    }).then(function (response) {
      defer.resolve(response.data)
    })

    return defer.promise
  }

}])

app.factory('getStartEndDates', ['$log', '$q', '$http', function($log, $q, $http) {

  return function () {
    return $http({
      method: 'GET',
      url: 'app/appServer/getStartEndDates.php'
    })
  }

}])

app.factory('submitHeadsUp', ['$log', '$q', '$http', function($log, $q, $http) {

  return function (personId, rawParams, genCarpoolSite, genPreferredProject) {

    var paramsToPass = JSON.stringify(rawParams)

    return $http({
      method: 'POST',
      url: 'app/appServer/submitHeadsUp.php',
      params: {
        person_id: personId,
        headsUpData: paramsToPass,
        genCarpoolSite: genCarpoolSite,
        genPreferredProject: genPreferredProject
      }
    })

  }

}])
