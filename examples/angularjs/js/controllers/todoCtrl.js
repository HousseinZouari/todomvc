/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store) {
		'use strict';

		var todos = $scope.todos = store.todos;

		$scope.newTodo = '';
		$scope.editedTodo = null;
		$scope.nextTodo = false;

		var indexTodosActions = 0;
		var todosActions = [];

		var ACTIONS = {
			UNDO_CMD: 'undoCmd',
			REDO_CMD: 'redoCmd'
		};
		todosActions.push(angular.copy($scope.todos));

		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};
		});

		$scope.addTodo = function () {
			var newTodo = {
				title: $scope.newTodo.trim(),
				completed: false
			};

			if (!newTodo.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newTodo)
				.then(function success() {
					$scope.newTodo = '';
					addTodoActions();
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);

		};

		/**
		 * function executed when click on  tab-key
		 */
		$scope.moveToNext = function() {
			$scope.nextTodo = true;
		};

		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			todo.title = todo.title.trim();

			if (todo.title === $scope.originalTodo.title) {
				if(!$scope.nextTodo) {
					$scope.editedTodo = null;
				} else {
					getNextTodo(todo);
				}
				return;
			}

			store[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {}, function error() {
					todo.title = $scope.originalTodo.title;
				})
				.finally(function () {
					$scope.editedTodo = null;
					if ($scope.nextTodo) {
						getNextTodo(todo);
					}
					addTodoActions();
				});
		};

		$scope.$on(ACTIONS.UNDO_CMD, function() {
			if (indexTodosActions >= 1) {
				getTodosFromUndoRedo(ACTIONS.UNDO_CMD);
			}
		});

		$scope.$on(ACTIONS.REDO_CMD, function() {
			if (indexTodosActions < todosActions.length - 1) {
				getTodosFromUndoRedo(ACTIONS.REDO_CMD);
			}
		});

		$scope.revertEdits = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
		};

		$scope.removeTodo = function (todo) {
			store.delete(todo);
			addTodoActions();
		};

		$scope.saveTodo = function (todo) {
			store.put(todo);
		};

		$scope.toggleCompleted = function (todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			store.put(todo, todos.indexOf(todo))
				.then(function success() {}, function error() {
					todo.completed = !todo.completed;
				});

			if(completed === undefined) {
				addTodoActions();
			}
		};

		$scope.clearCompletedTodos = function () {
			store.clearCompleted();
			addTodoActions();
		};

		$scope.markAll = function (completed) {
			$scope.todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
			addTodoActions();
		};

		/**
		 * function to Save the action (eg. check off, edit, adding a to-do and deleting a to-do)
		 */
		function addTodoActions() {
			indexTodosActions += 1;
			todosActions.splice(indexTodosActions, 0, angular.copy($scope.todos));

		}

		/**
		 * function to discard the changes
		 */
		function getTodosFromUndoRedo(type) {
			if (type == ACTIONS.UNDO_CMD) {
				indexTodosActions -= 1;
			} else {
				indexTodosActions += 1;
			}
			$scope.$apply(function() {
				$scope.todos = angular.copy(todosActions[indexTodosActions]);
				store.todos = $scope.todos;
				if (type == ACTIONS.REDO_CMD) {
					store._saveToLocalStorage(angular.copy(todosActions[indexTodosActions]));
				}
			});
		}

		/**
		 * function to Next todo focus
		 */
		function getNextTodo(todo) {

			var index = $scope.todos.indexOf(todo);
			$scope.nextTodo = false;

			if (index < $scope.todos.length - 1) {
				$scope.editedTodo = $scope.todos[index + 1];
			} else {
				$scope.editedTodo = $scope.todos[0];
			}
		}
	});
