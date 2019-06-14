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
        response.data['records'].forEach(function (currentSite) {
          sites[currentSite.id] = currentSite.fields
          sites[currentSite.id]['id'] = currentSite.id
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

app.factory('getExistingDates', ['$log', '$q', '$http', function ($log, $q, $http) {

  return function (personId) {
    $log.log('getCarpoolSites ran!')
    var defer = $q.defer()

    $http({
      url: `https://api.airtable.com/v0/${getAirtableBase()}/Heads%20Up?api_key=${getAirtableAPIKey()}`,
      method: "GET",
      filterByFormula: `{Volunteer ID} = ${personId}`
    }).then(
      function (response) {

        var existingDates = new Array();
        response.data['records'].forEach(function (currentDate) {
          existingDates.push(currentDate.fields);
        });

        defer.resolve(existingDates);
      },
      function (error) {
        //TODO error handling
      })

    return defer.promise
  }

}])

app.factory('getStartEndDates', ['$log', '$q', '$http', function($log, $q, $http) {

  return function () {
    $log.log('getCarpoolSites ran!')
    var defer = $q.defer()

    $http({
      url: `https://api.airtable.com/v0/${getAirtableBase()}/Summer%20Dates?api_key=${getAirtableAPIKey()}`,
      method: "GET"
    }).then(
      function (response) {
        var dates = {
          summerStart: {},
          summerEnd: {},
          daysOff: [],
        }
        response.data['records'].forEach(function (currentDate) {
          var fields = currentDate.fields;
          if (fields['Type'] == "Summer Start Date") {
            dates.summerStart = fields;
          } else if (fields['Type'] == "Summer End Date") {
            dates.summerEnd = fields;
          } else if (fields['Type'] == "Day Off") {
            dates.daysOff.push(fields);
          }
        })

        defer.resolve(dates)
      },
      function (error) {
        //TODO error handling
      })

    return defer.promise
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
