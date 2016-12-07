// public/core.js
var auctionTracker = angular.module('auctionTracker', []);

function mainController($scope, $http) {
    $scope.formData = {};`

    // when landing on the page, get all todos and show them
    $http.get('/api/track')
        .success(function(data) {
            $scope.auctions = data;
            console.log("Data pulled from API.");
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTracking = function() {
        $http.post('/api/itemsToCheck', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.auctions = data;
                console.log("Added item or recipe to database.");
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTracking = function(id) {
        $http.delete('/api/titemsToCheck/' + id)
            .success(function(data) {
                $scope.auctions = data;
                console.log("Deleted item or recipe from database.");
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}