var app = angular.module('headsUpApp', ['ngMaterial', 'ui.router'])

app.config(function($stateProvider) {
  $stateProvider
    .state('headsUp', {
      url: '/headsup',
      templateUrl: 'app/views/headsUp.html',
      controller: 'HeadsUpStateController',
      data: {requireLogin: true}
    })

      .state('headsUp.id', {
        url: '/id',
        templateUrl: 'app/views/headsUpId.html',
        controller: 'HeadsUpIdController',
        data: {requireLogin: true}
      })
      .state('headsUp.info', {
        url: '/info',
        templateUrl: 'app/views/headsUpInfo.html',
        controller: 'HeadsUpInfoController',
        params: {myPerson: null}
      })
      .state('headsUp.confirm', {
        url: '/confirm',
        templateUrl: 'app/views/headsUpConfirm.html',
        controller: 'HeadsUpConfirmController',
        params: {myPerson: null}
      })
})

//open to volunteer info page by default
app.config(function($urlRouterProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $urlRouterProvider.when('', '/headsup/id')
})

app.filter('phoneNumber', function($log) {

  return function(input) {
    if (!input) {
      return input
    }
    $log.log("phoneNumber input: " + input)
    var hasLeadingOne = (input.length == 11)
    return ((hasLeadingOne) ? '+' + input.substr(0, 3) + ' ' : '') + input.substr(0, 3) + '-' + input.substr(3,3) + '-' + input.substr(6, 4)
  }
})
