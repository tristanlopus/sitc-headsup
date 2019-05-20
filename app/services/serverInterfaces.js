app.factory('getCarpoolSites', ['$log', '$q', '$http', function ($log, $q, $http) {

  return function () {
    $log.log('getCarpoolSites ran!')
    var defer = $q.defer()

    $http({
      url: `https://api.airtable.com/v0/${getAirtableBase()}/Carpool%20Sites?api_key=${getAirtableAPIKey()}`,
      method: "GET"
    }).then(
      function (response) {
        var sites = {}
        console.log(response.data)
        response.data['records'].forEach(function (currentSite) {
          sites[currentSite.id] = currentSite.fields
          sites[currentSite.id]['id'] = currentSite.id
          console.log(sites[currentSite.id])
        })

        defer.resolve(sites)
      },
      function (error) {
        //TODO error handling
      })

    return defer.promise
  }
}])

app.factory('getPerson', ['$log', '$q', '$http', function($log, $q, $http) {

  return function (withEmail) {
    var defer = $q.defer()

    $http({
      url: `https://api.airtable.com/v0/${getAirtableBase()}/Profiles?api_key=${getAirtableAPIKey()}&filterByFormula={Email}='${withEmail}'`,
      method: "GET"
    }).then(
      function (response) {
        var persons = []
        console.log(response.data)
        response.data['records'].forEach(function (currentPerson) {
          persons.push(currentPerson.fields)
        })

        defer.resolve(persons)
      },
      function (error) {
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
