/**
 * Directive for detecting ctrl + y function.
 */
angular.module('todomvc')
	.directive('todoRedo', ['$rootScope',function ($rootScope) {
		'use strict';

		var Y_KEY = 89;
		var REDO_CMD = 'redoCmd';
		var KEY_DOWN_FUNCTION = 'keydown';

		return function (scope, elem, attrs) {
			elem.bind(KEY_DOWN_FUNCTION, function (event) {
				if (event.keyCode === Y_KEY && event.ctrlKey) {
					$rootScope.$broadcast(REDO_CMD);
				}
			});

			scope.$on('$destroy', function () {
				elem.unbind(KEY_DOWN_FUNCTION);
			});
		};
	}]);
