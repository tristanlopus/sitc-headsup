var app = angular.module('headsUpApp')

app.controller('HeadsUpIdController', ['$scope', '$log', '$state', 'getPerson', function($scope, $log, $state, getPerson) {
  $log.log('Hello, world! HeadsUpIdController is running!')

  $scope.potentialPersons = []

  $scope.findPerson = function (withEmail) {
    getPerson(withEmail).then(function (persons) {
      $log.log("Response from getPerson(): " + dump(persons, 'none'))
      $scope.potentialPersons = persons
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
