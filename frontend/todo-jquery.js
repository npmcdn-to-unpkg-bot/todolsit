// ======= INIT ======

// TodoEditor namespace, placeholders, etc
te = {
	taskCont: false,
	taskEditor: false,
	taskTemplate: false,
	api: '/api/php/task/',
	//api: 'http://localhost:8080/task/',
	tasks: {}
};

// Inits get called on document ready
te.init = function() {
	te.taskCont = $('ul.task-list');
	te.taskEditor = $('div.task-editor');
	te.taskEditor.find('input').change(te.formChangeEvent);
	te.taskEditor.find('button').click(te.formButtonEvent);
	te.taskTemplate = $('ul.task-list > li.task-template').clone();
	te.taskTemplate.removeClass('task-template');
	te.taskTemplate.addClass('task');
	te.taskCont.html("");
	te.getTasks();
};

// Renders the list of task from te.tasks
// Should propably also take more responsibility for rendering the editor
te.render = function(id) {
	if(typeof(id) === 'undefined') {
		for(var i in te.tasks) {
			te.render(te.tasks[i].id);
		}
	} else {
		var task = te.tasks[id];
		if(typeof(task) == 'undefined') {
			te.taskCont.find('.task[data-id="' + id + '"]').remove();
		} else {
			var taskObj = te.taskCont.find('.task[data-id="' + task.id + '"]');
			if(taskObj.length < 1) {
				taskObj = te.taskTemplate.clone();
				taskObj.attr('data-id', task.id);
				taskObj.change(te.changeStatusEvent);
				taskObj.click(te.focusTaskEvent);
				te.taskCont.append(taskObj);
			}
			taskObj.find('.title').text(task.title);
			taskObj.find('.description').text(task.description);
			taskObj.find('.status').prop('checked', task.status);
		}
	}
};

// ====== Event listeners =======

// Event listener: a task gets focus
te.focusTaskEvent = function(e) {
	if($(e.target).hasClass('status')) {
		return true;
	}
	te.editTask(e.delegateTarget.dataset.id);
};

// Event listener: a task had its status changed
te.changeStatusEvent = function(e) {
	var task = te.tasks[e.delegateTarget.dataset.id];
	task.status = $(e.delegateTarget).find('.status').prop('checked');
	te.pushChange(task.id);
};

// Event listener: something has been changed in the editor form
te.formChangeEvent = function(e) {
	var task = te.getTaskFromForm();
	if(task.id !== '') {
		te.addTask(task);
		te.pushChange(task.id);
	}
};

// Event listener: a form button has been pressed
te.formButtonEvent = function(e) {
	var task = {};

	if($(e.target).hasClass('new')) {
		te.editTask("");

	} else if($(e.target).hasClass('save')) {
		task = te.getTaskFromForm();
		if(task.id === "") {
			te.createTask(task);
			te.editTask("");
		} else {
			te.pushChange(task.id);
		}

	} else if($(e.target).hasClass('delete')) {
		task = te.getTaskFromForm();
		te.deleteTask(task.id);
		te.editTask("");
	}
	e.preventDefault();
};

// Start editing a task in the editor
te.editTask = function(id) {
	var task = te.tasks[id];
	if(typeof(task) == 'undefined') {
		task = {
			'id': '',
			'title': '',
			'description': '',
			'status': false,
		};
		te.taskEditor.find('.delete').addClass('disabled');
	} else {
		te.taskEditor.find('.delete').removeClass('disabled');
	}
	te.taskEditor.find('.id').val(task.id);
	te.taskEditor.find('.title').val(task.title);
	te.taskEditor.find('.description').val(task.description);
	te.taskEditor.find('.status').prop('checked', task.status);
};

// ===== Various task helpers ======

// Traverses form fields to generate a valid task object
te.getTaskFromForm = function() {
	var task = {};
	task.id = te.taskEditor.find('.id').val();
	task.title = te.taskEditor.find('.title').val();
	task.description = te.taskEditor.find('.description').val();
	task.status = te.taskEditor.find('.status').prop('checked');
	return task;
};

// Generates a task from json data, used by api-request methods
te.getTaskFromJSON = function(json) {
	var task = {};
	if(json.id === null || json.id === "") {
		task.id = undefined;
	} else {
		task.id = json.id;
	}
	if(json.status === false || json.status === "false" || json.status === null || json.status === "0" || json.status === 0) {
		task.status = false;
	} else  {
		task.status = true;
	}
	task.title = json.title;
	task.description = json.description;

	return task;
};

// Adds (or updates) a task, and lets the renderer know
te.addTask = function(task) {
	te.tasks[task.id] = task;
	te.render(task.id);
};

// Removes a task and lets the renderer know
te.hideTask = function(id) {
	delete te.tasks[id];
	te.render(id);
};

// ====== API calls =======

// Get all tasks
te.getTasks = function() {
	$.ajax({
		url: te.api,
		type: 'GET',
		dataType: 'json',
		contentType: "application/json",
		success: function (data, textStatus, jqXHR) {
			for(var i in data) {
				te.addTask(te.getTaskFromJSON(data[i]));
			}
		},
		error: function (jqXHR, textStatus, error) {
			console.log(error);
		}
	});
};

// Delete a task
te.deleteTask = function(id) {
	$.ajax({
		url: te.api + id,
		type: 'DELETE',
		dataType: 'json',
		contentType: "application/json",
		success: function (data, textStatus, jqXHR) {
			te.hideTask(id);
		},
		error: function (jqXHR, textStatus, error) {
			console.log(error);
		}
	});
};

// Create a task
te.createTask = function(task) {
	$.ajax({
		url: te.api,
		type: 'POST',
		dataType: 'json',
		contentType: "application/json",
		data: JSON.stringify(task),
		success: function (data, textStatus, jqXHR) {
			te.addTask(te.getTaskFromJSON(data));
		},
		error: function (jqXHR, textStatus, error) {
			console.log(error);
		}
	});
};

// Push/Update a task
te.pushChange = function(id) {
	var task = te.tasks[id];
	$.ajax({
		url: te.api + task.id,
		type: 'PUT',
		dataType: 'json',
		contentType: "application/json",
		data: JSON.stringify(task),
		success: function (data, textStatus, jqXHR) {
			te.addTask(te.getTaskFromJSON(data));
		},
		error: function (jqXHR, textStatus, error) {
			console.log(error);
		}
	});
};

$(function () {
	te.init();
});
