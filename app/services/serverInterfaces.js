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
      url: `https://api.airtable.com/v0/${getAirtableBase()}/Heads%20Up?api_key=${getAirtableAPIKey()}&filterByFormula={Volunteer ID}='${personId}'`,
      method: "GET",
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

  return function (personId, rawDateData, existingDates) {

    // To iterate over an array asynchronously — in our case, so that several Airtable calls can be made simultaneously — requires some convoluted logic
    // Thank you to Maxim (https://stackoverflow.com/users/347735/maxim) on Stack Overflow for this solution
    var dates = rawDateData;

    console.log("PERSON ID: " + personId);

    // for each date, determine whether the corresponding record needs to be created or updated
    var existingDateStrings = Object.keys(existingDates);
    var requestObjs = [];
    for (var k = 0; k < dates.length; k++) {
      var date = dates[k];
      var reqObj = {
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          "fields": {}
        }
      };
      if (existingDateStrings.includes(date.dateString)) {
        reqObj['url'] = `https://api.airtable.com/v0/${getAirtableBase()}/Heads%20Up/${existingDates[date.dateString]["Record ID"]}?api_key=${getAirtableAPIKey()}`;

        if (!date.isComing) {
          reqObj['method'] = "DELETE"
          requestObjs.push(reqObj);
          continue;
        } else {
          reqObj['method'] = "PATCH"
        }
      } else {
        if (!date.isComing) {
          continue;
        }

        reqObj['url'] = `https://api.airtable.com/v0/${getAirtableBase()}/Heads%20Up?api_key=${getAirtableAPIKey()}`,
        reqObj['method'] = "POST"
        reqObj.data.fields["Volunteer ID"] = [personId];
        reqObj.data.fields["Date"] = date.dateString;
      }

      if (date.carpoolSite) {
        reqObj.data.fields["Carpool Site"] = [date.carpoolSite];
      }
      if (date.preferredProject) {
        reqObj.data.fields["Project Preference"] = date.preferredProject;
      }
      if (date.hasCar) {
        reqObj.data.fields["Can Drive"] = date.hasCar;
      }
      if (date.numPassengers) {
        reqObj.data.fields["Passengers"] = date.numPassengers;
      }
      
      requestObjs.push(reqObj);
    }

    // This is your async function, which may perform call to your database or
    // whatever...
    function sendRequestToAirtable(reqObj, cb) {
      return $http(reqObj);
    }

    // cb will be called when each item from arr has been processed and all
    // results are available.
    function eachAsync(reqObjs, func, defer) {
      var doneCounter = 0,
        results = [];
      var recvdError = false;
      reqObjs.forEach(function (reqObj) {
        func(reqObj).then(function (res) {
          doneCounter++;
          if (!res.data.id) {
            recvdError = true;
          }
          if (doneCounter === reqObjs.length) {
            if (recvdError) {
              defer.reject();
            } else {
              defer.resolve();
            }
          }
        });
      });
    }

    var defer = $q.defer();
    eachAsync(requestObjs, sendRequestToAirtable, defer);
    return defer.promise;


  }

}])
