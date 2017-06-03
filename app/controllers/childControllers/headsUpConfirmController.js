app.controller('HeadsUpConfirmController', ['$scope', '$log', '$state', '$stateParams', function($scope, $log, $state, $stateParams) {

  $scope.goToId = function () {
    $state.go('headsUp.id')
  }

}])
