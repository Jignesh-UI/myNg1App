var myapp = angular.module("MyApp", ['ngRoute', 'ngSanitize']).config(function ($routeProvider, $locationProvider) {
	$routeProvider.when("/login", {
		templateUrl: 'login.html',
		url: '#login',
		controller: 'LoginController'
	});

	$routeProvider.when('/investments', {
		templateUrl: 'investments.html',
		controller: 'investmentsController'
	});

	$routeProvider.when('/stock', {
		templateUrl: 'old_stock.html',
		controller: 'oldStocksController'
	});

	$routeProvider.when('/planning', {
		templateUrl: 'planning.html',
		controller: 'planningController'
	});
	$routeProvider.when('/buysell', {
		templateUrl: 'buysell.html',
		controller: 'buySellController'
	});
	$routeProvider.when('/phonecode', {
		templateUrl: 'phonecode.html',
		controller: 'phonecodeController'
	});
	$routeProvider.when('/mfcalc', {
		templateUrl: 'mfcalc.html',
		controller: 'mfcalculator'
	});
	$routeProvider.when('/ulip', {
		templateUrl: 'ulip.html',
		controller: 'ulipcontroller'
	});
	$routeProvider.when('/profile',{
		templateUrl:'profile.html',
		controller:'profileController'
	})

	$routeProvider.otherwise({ redirectTo: '/login' });

}).factory('userService', function () {
	var credentials = {
		username: "j",
		password: "j"
	};
	return {
		login: function (username, password) {
			if (username === "j" && password === "j") {
				credentials.username = username;
				credentials.password = password;
				return true;
			}
		},
		chkusername: function () {
			return credentials.username;
		},
		checkuserpwd: function () {
			return credentials.password;
		}
	}
}).controller("LoginController", function ($scope, $location, userService) {
	$scope.login = function () {
		var firstlogin = userService.login($scope.username, $scope.password);
		if (firstlogin) {
			$location.path("/investments");
		}
	}
}).controller("investmentsController", ['$http', '$scope', '$location', 'userService', function ($http, $scope, $location, userService) {
	$scope.q = '';
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.local_summary = [];
	$http.get("js/summary.txt").success(function (data, status, headers, config) {
		$scope.local_summary = data;
	});
	$scope.yearwiseTotal = function (obj) {
		var i = 0;
		$scope.total = 0;
		for (i = 0; i < obj.Summary.length; i++) {
			$scope.total = $scope.total + obj.Summary[i].Installment;
		}
		return $scope.total;
	}
	$scope.yearwiseInterest = function (obj) {
		return obj.IntrestCredit;
	}
}]).controller("setnavigation", ['$scope', function ($scope) {
	$scope.currentNav = 0;
	$scope.selectTab = function (settab) {
		$scope.currentNav = settab;
	};
	$scope.isSelected = function (chk) {
		return $scope.currentNav === chk;
	};
}]).controller("oldStocksController", ['$scope', '$http', '$filter', 'userService', '$location', function ($scope, $http, $filter, userService, $location) {
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.Math = window.Math;
	$scope.q = '';
	$scope.txtstock = "";
	$scope.txtAction = "";
	$scope.txtqty = "";
	$scope.local_summary = [];
	$scope.netPurchase = 0;
	$scope.netSales = 0;
	$scope.currentHolding = 0;
	$http.get("js/stock.json").success(function (data, status, headers, config) {

		$scope.local_summary = data;
		$scope.uniqueDates = $filter('unique')(data, "Date");
		$scope.TotalTradedValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + parseFloat(obj[i].TradeValue.replace(',', '').replace('', ''));
			}
			return sum;
		};
		$scope.TotalBrokerageValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + obj[i].Brokerage_incl_taxes;
				if (obj[i].Action == "Sell") {
				}

			}
			return sum;
		};
		$scope.TotalNetValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) + obj[i].Brokerage_incl_taxes);
			}
			return sum;
		};
		$scope.TotalPurchaseValue = function (optval, obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				if (obj[i].Action == "Buy" && optval == "Buy") {
					sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) + obj[i].Brokerage_incl_taxes);
				} else if (obj[i].Action == "Sell" && optval == "Sell") {
					sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) - obj[i].Brokerage_incl_taxes);
				} else if (obj[i].Status == "Hold" && optval == "Hold") {
					sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) + obj[i].Brokerage_incl_taxes);
				}
			}
			if (optval == "Buy") {
				$scope.netPurchase = sum;
			} else if (optval == "Sell") {
				$scope.netSales = sum;
			} else if (optval == "Hold") {
				$scope.currentHolding = sum;
			}
			return sum;
		}
		$scope.NetProfitLoss = function (optval) {
			return $scope.netSales - $scope.netPurchase + $scope.currentHolding;
		}

		$scope.parseFloat = function (oval) {
			return parseFloat(parseFloat(oval.replace(',', '').replace('', '')));
		}

	});
}]).filter('unique', function () {
	return function (arr, field) {
		var newobj = {}, i, arrlength = arr.length, sortlisted = [];
		for (i = 0; i < arrlength; i += 1) {
			newobj[arr[i][field]] = arr[i];
		}
		for (i in newobj) {
			sortlisted.push(newobj[i]);
		}
		return sortlisted;
	};
}).controller("planningController", ['$http', '$scope', 'userService', '$location', function ($http, $scope, userService, $location) {
	$scope.Name = "";
	$scope.Rate = "";
	$scope.Quantity = "";
	$scope.BasicBrock = "";
	$scope.TaxRate = "";
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.salingratio = [
		{ "Diff": "10%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "20%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "30%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "40%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "50%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "60%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "70%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "80%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "90%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 },
		{ "Diff": "100%", "DiffAmt": 0, "Amt": 0, "Brock": 0, "Sell": 0, "Earned": 0 }
	];
	$scope.fullcontrol = false;
	$scope.BasicBrock = 0.55;
	$scope.TaxRate = 12.5;
	$scope.Rate;
	$scope.Quantity;
	$scope.calculate = function (obj) {
		if (parseInt($scope.Rate) && parseInt($scope.Quantity)) {
			$scope.Price = parseInt($scope.Rate) * parseInt($scope.Quantity);
			$scope.Brokerage = parseFloat((($scope.Price * $scope.BasicBrock) / 100));
			$scope.ServiceTax = (($scope.Brokerage * $scope.TaxRate) / 100);
			$scope.NetBrokerage = $scope.Brokerage + $scope.ServiceTax;
			$scope.NetAmount = $scope.NetBrokerage + $scope.Price;
			for (var i = 0; i < $scope.salingratio.length; i++) {
				var sum = 0;
				sum = sum + 0;
				$scope.salingratio[i].DiffAmt = ((parseInt($scope.Rate) * parseInt($scope.salingratio[i].Diff)) / 100) + parseInt($scope.Rate);
				$scope.salingratio[i].Amt = ((((parseInt($scope.Rate) * parseInt($scope.salingratio[i].Diff)) / 100) + parseInt($scope.Rate)) * parseInt($scope.Quantity));
				$scope.salingratio[i].Brock = (($scope.salingratio[i].Amt * $scope.BasicBrock) / 100) + (((($scope.salingratio[i].Amt * $scope.BasicBrock) / 100) * $scope.TaxRate) / 100);
				$scope.salingratio[i].Sell = $scope.salingratio[i].Amt - $scope.salingratio[i].Brock;
				$scope.salingratio[i].Earned = $scope.salingratio[i].Sell - $scope.NetAmount;
			}
			$scope.fullcontrol = true;
		}
	};
}]).controller("buySellController", ['$scope', '$http', 'userService', '$location', '$filter', function ($scope, $http, userService, $location, $filter) {
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.Math = window.Math;
	$scope.txtpstock = "";
	$scope.txtsstock = "";
	$scope.txthstock = '';
	$http.get("js/stock.json").success(function (data, status, headers, config) {
		$scope.local_summary = data;
		$scope.BuyData = $filter('filter')(data, { "Action": "Buy" });
		$scope.SellData = $filter('filter')(data, { "Action": "Sell" });
		$scope.HoldData = $filter('filter')(data, { "Action": "Buy", "Status": "Hold" });
		$scope.TotalTradedValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + parseFloat(obj[i].TradeValue.replace(',', '').replace('', ''));
			}
			return sum;
		};
		$scope.TotalBrokerageValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + obj[i].Brokerage_incl_taxes;
			}
			return sum;
		};
		$scope.TotalNetValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) + obj[i].Brokerage_incl_taxes);
			}
			return sum;
		};
		$scope.NetSoldValue = function (obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				sum = sum + (parseFloat(obj[i].TradeValue.replace(',', '').replace('', '')) - obj[i].Brokerage_incl_taxes);
			}
			return sum;
		};
		$scope.TotalPurchaseValue = function (optval, obj) {
			var sum = 0;
			for (var i = 0; i < obj.length; i++) {
				if (obj[i].Action == "Buy" && optval == "Buy") {
					sum = sum + (obj[i].TradeValue + obj[i].Brokerage_incl_taxes);
				} else if (obj[i].Action == "Sell" && optval == "Sell") {
					sum = sum + (obj[i].TradeValue + obj[i].Brokerage_incl_taxes);
				}
			}
			if (optval == "Buy") {
				$scope.netPurchase = sum;
			} else if (optval == "Sell") {
				$scope.netSales = sum;
			}
			return sum;
		}
		$scope.NetProfitLoss = function (optval) {
			return $scope.netSales - $scope.netPurchase;
		}
		$scope.parseFloat = function (oval) {
			return parseFloat(parseFloat(oval.replace(',', '').replace('', '')));
		}
	});
}]).controller('phonecodeController', ['$scope', '$http', 'userService', '$location', function ($scope, $http, userService, $location) {
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.txtcode = '';
	$scope.txtdesc = '';
	$http.get('js/phonecodes.json').success(function (data, status, headers, config) {
		$scope.phonecodedata = data;
	});
}]).controller('mfcalculator', function ($scope, $http, $location, userService) {
	if (userService.chkusername().length == 0 && userService.checkuserpwd().length == 0) {
		$location.path("/login");
		return
	}
	$scope.txtcurrate;
	$scope.totalUnits = 0;
	$scope.totalPurchase = 0;
	$scope.netprofit = 0;
	$http.get("js/mf.json").success(function (data, status, headers, config) {
		$scope.mfdata = data;
		for (var i = 0; i < data.length; i++) {
			$scope.totalUnits = 0;
			$scope.totalPurchase = 0;
			$scope.netprofit = 0;
			for (j = 0; j < data[i].Details.length; j++) {
				$scope.totalUnits = $scope.totalUnits + parseFloat(data[i].Details[j].Units);
				$scope.totalPurchase += parseFloat(data[i].Details[j].Net);
			}
		}
	});
	$scope.netReturn = function (queryData) {
		var i = 0, j = 0;
		for (i = 0; i < queryData.length; i++) {
			$scope.totalUnits = 0;
			for (j = 0; j < queryData[i].Details.length; j++) {
				$scope.totalUnits = $scope.totalUnits + queryData[i].Details[j].Units;
			}
		}
		return $scope.txtcurrate * $scope.totalUnits;
	}
	$scope.profitLoss = function (queryData) {
		var i = 0, j = 0;
		for (i = 0; i < queryData.length; i++) {
			$scope.totalUnits = 0;
			$scope.totalPurchase = 0;
			for (j = 0; j < queryData[i].Details.length; j++) {
				$scope.totalUnits = $scope.totalUnits + queryData[i].Details[j].Units;
				$scope.totalPurchase = $scope.totalPurchase + queryData[i].Details[j].Net;
			}
		}
		return ($scope.txtcurrate * $scope.totalUnits) - $scope.totalPurchase;
	}
}).controller("ulipcontroller", function ($scope, $http) {
	$scope.totalProfit;
	$scope.finalProfitDate;
	$scope.Math = window.Math;
	var today = new Date();
	var dd = today.getDate() - 1;
	var mm = today.getMonth() + 1;
	var yy = today.getFullYear();
	today = mm + "/" + dd + "/" + yy;
	$http.get("js/ulip.json").success(function (data) {
		$scope.ulipdata = data;
		$scope.totalProfit = data[data.length - 1].Net;
		$scope.finalProfitDate = data[data.length - 1].Date
	}).error(function () {
		alert("Data is not loaded");
	});
	$scope.netReturn = function () {
		var netval
		return "As on: " + $scope.finalProfitDate + " Inr. " + $scope.totalProfit + "/-";
	}
}).controller("profileController",["$scope","$http",function($scope,$http){
	$http.get("js/profile.json").success(function (data) {
		$scope.profileData = data;
	  })
}])