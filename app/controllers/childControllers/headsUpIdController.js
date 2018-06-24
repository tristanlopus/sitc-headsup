var app = angular.module('headsUpApp')

app.controller('HeadsUpIdController', ['$scope', '$window', '$log', '$state', 'getPerson', function($scope, $window, $log, $state, getPerson) {
  $log.log('Hello, world! HeadsUpIdController is running!')

  $scope.potentialPersons = []
  $scope.notFound = false

  $scope.findPerson = function (withEmail) {
    getPerson(withEmail).then(function (persons) {
      $log.log("Response from getPerson(): " + dump(persons, 'none'))
      $scope.potentialPersons = persons
      $scope.notFound = false
    }, function notFound () {
      $log.log("Person not found")
      $scope.notFound = true
      var field = $window.document.getElementById('emailInput')
      field.focus()
      field.select()
    })
  }

  $scope.selectPerson = function (index) {
    $log.log("Selected Person: " + dump($scope.potentialPersons[index], 'none'))
    // $scope.person = $scope.potentialPersons[index]
    var person = $scope.potentialPersons[index]

    if (localStorage.getItem('person')) {
      localStorage.removeItem('person')
    }

    // create local storage entry for this person info
    var expirationDate = new Date()
    expirationDate.setHours(24,0,0,0)
    person['expirationDate'] = expirationDate.toString()

    localStorage.setItem("person", JSON.stringify(person))

    $state.go('headsUp.info', {myPerson: person})
  }


}])
