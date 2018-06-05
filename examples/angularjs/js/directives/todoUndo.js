/**
 * Directive for detecting ctrl + z function.
 */
angular.module('todomvc')
	.directive('todoUndo', ['$rootScope',function ($rootScope) {
		'use strict';

		var Z_KEY = 90;
		var UNDO_CMD = 'undoCmd';
		var KEY_DOWN_FUNCTION = 'keydown';

		return function (scope, elem, attrs) {

			elem.bind(KEY_DOWN_FUNCTION, function (event) {
				if (event.keyCode === Z_KEY && event.ctrlKey) {
					$rootScope.$broadcast(UNDO_CMD);
				}
			});

			scope.$on('$destroy', function () {
				elem.unbind(KEY_DOWN_FUNCTION);
			});

		};
	}]);
