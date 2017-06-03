app.controller('HeadsUpStateController', ['$scope', '$log', '$state', function($scope, $log, $state, parallaxHelper) {

  $log.log("Hello, World! HeadsUpStateController is running!")

  // $state.go('headsUp.info')

  $scope.person = {}

  if (localStorage.getItem("person")) {
    var personInfo = JSON.parse(localStorage.getItem("person"))
    var currentExpirationDate = new Date(personInfo.expirationDate)
    var now = new Date()
    if (currentExpirationDate.getTime() > now.getTime()) {
      $scope.person = personInfo
    }
  }

}])
