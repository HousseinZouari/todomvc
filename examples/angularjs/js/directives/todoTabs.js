/**
 * Directive for tab to jump to next todo
 */
angular.module('todomvc')
	.directive('todoTabs', function () {
		'use strict';

		var TAB_KEY = 9;
		var KEY_DOWN_FUNCTION = 'keydown';

		return function (scope, elem, attrs) {

			elem.bind(KEY_DOWN_FUNCTION, function (event) {
				if (event.keyCode === TAB_KEY) {
					scope.$apply(attrs.todoTabs);
				}
			});

			scope.$on('$destroy', function () {
				elem.unbind(KEY_DOWN_FUNCTION);
			});
		};
	});
