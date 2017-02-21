var app = angular.module("MyApp", []);
app.directive("listMfData",function(){
	return{
		templateUrl:"mfdirective.html",
		restrict:"E",
		controller:function($scope,$http,$filter){
			$scope.JsonData = [];
			$scope.lastSubmit = [];			
			$http.get('all.json').success(function(data,status,headers,config){
				$scope.JsonData = data;
				$scope.lastSubmit = data;
				$scope.Math = window.Math;
				$scope.Average=function(){
					$scope.t=0;
					$scope.ddata=[];
					$scope.ddata=$filter("filter")($scope.lastSubmit.SectorsList,{
						"Sector":$scope.txtsector
					});
					for(var i = 0; i<$scope.ddata.length;i++){
						$scope.t = $scope.t + parseFloat($scope.ddata[i].percentage);
					}
					return $scope.t;
				};
				$scope.resetdata = function(){
					$scope.txtsector="";
					$scope.t=0;
				};
			}).error(function(data,status,headers,config){
				alert(data);
			});		
			$scope.radioChanged=function(mdata){
				$scope.lastSubmit=[];
				$scope.lastSubmit=mdata;
			};
		}
	};
});