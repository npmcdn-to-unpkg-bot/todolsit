var api = '/api/php/task/';
//var api = 'http://localhost:8080/task/';

// Main Todo app component, handles api communication and main state
class TodoApp extends React.Component {
	constructor() {
		super();
		this.state = {
			'tasks': {},
			//temptask is used when we are editing a NEW task
			'temptask': {
				'id': undefined,
				'title': '',
				'description': '',
				'status': false,
			},
			//editing is used when we are editing an existing task
			'editing': undefined
			};
		this.deleteTask = this.deleteTask.bind(this);
		this.saveTask = this.saveTask.bind(this);
		this.editTask = this.editTask.bind(this);
		this.editTaskPreview = this.editTaskPreview.bind(this);
		this.editTaskComplete = this.editTaskComplete.bind(this);
	}
	componentDidMount() {
		this.getTasks();
	}
	//Update or create task based on input
	saveTask(task) {
		if(task.id !== undefined) {
			$.ajax({
				url: this.props.url + task.id,
				type: 'PUT',
				dataType: 'json',
				contentType: "application/json",
				data: JSON.stringify(task),
				success: function (data, textStatus, jqXHR) {
					var tasks = this.state.tasks;
					tasks[data.id] = this.cleanTaskObj(data);
					this.setState({ 'tasks': tasks });
				}.bind(this),
				error: function (jqXHR, textStatus, error) {
					console.log(error);
				}
			});
		} else {
			$.ajax({
				url: this.props.url,
				type: 'POST',
				dataType: 'json',
				contentType: "application/json",
				data: JSON.stringify(task),
				success: function (data, textStatus, jqXHR) {
					var tasks = this.state.tasks;
					tasks[data.id] = this.cleanTaskObj(data);
					this.setState({ 'tasks': tasks });
				}.bind(this),
				error: function (jqXHR, textStatus, error) {
					console.log(error);
				}
			});
		}
	}
	//Delete task
	deleteTask(task) {
		$.ajax({
			url: this.props.url + task.id,
			type: 'DELETE',
			dataType: 'json',
			contentType: "application/json",
			data: JSON.stringify(task),
			success: function (data, textStatus, jqXHR) {
				var tasks = this.state.tasks;
				delete tasks[task.id];
				this.setState({ 'tasks': tasks });
			}.bind(this),
			error: function (jqXHR, textStatus, error) {
				console.log(error);
			}
		});
		//If we are editing the deleted task, stop editing
		if(task.id == this.state.editing) {
			this.editTaskComplete();
		}
	}
	//Get all tasks
	getTasks() {
		$.ajax({
			url: this.props.url,
			type: 'GET',
			dataType: 'json',
			success: function (data, textStatus, jqXHR) {
				this.setState({
					'tasks': this.getTasksObj(data)
				});
			}.bind(this),
			error: function (jqXHR, textStatus, error) {
				console.log(error);
			}
		});
	}
	//Start editing a task
	editTask(task) {
		this.setState({ 'editing': task.id });
	}
	//Preview any changes to task, without saving to Api
	editTaskPreview(task) {
		if(task.id !== undefined) {
			var tasks = this.state.tasks;
			tasks[task.id] = task;
			this.setState({ 'tasks': tasks });
		} else {
			this.setState({ 'temptask': task });
		}
	}
	//Stop editing
	editTaskComplete() {
		this.setState({
				'editing': undefined,
				'temptask': {
					'id': undefined,
					'title': '',
					'description': '',
					'status': false,
				}
			});
	}
	//Helper classes to simplify task import
	cleanTaskObj(task) {
		if(task.status === false || task.status === "false" || task.status === null || task.status === "0" || task.status === 0) {
			task.status = false;
		} else {
			task.status = true;
		}
		return task;
	}
	getTasksObj(tasks) {
		var tasksObj = {};
		for(var i in tasks) {
			tasksObj[tasks[i].id] = this.cleanTaskObj(tasks[i]);
		}
		return tasksObj;
	}
	render() {
		var activeTask = this.state.editing ? this.state.tasks[this.state.editing] : this.state.temptask;
		return <div className="todo-app">
			<TaskList tasks={this.state.tasks} active={activeTask.id} onChange={this.saveTask} onEditStart={this.editTask} onDelete={this.deleteTask}/>
			<hr />
			<TaskEditor task={activeTask} onChange={this.editTaskPreview} onSubmit={this.saveTask} onComplete={this.editTaskComplete}/>
		</div>
	}
}

// Task list component. Displays an unordered list of tasks
class TaskList extends React.Component {
	render() {
		var tasksObj = [];
		for(var i in this.props.tasks) {
			var active = this.props.active == this.props.tasks[i].id;
			tasksObj.push(<Task active={active} key={this.props.tasks[i].id} title={this.props.tasks[i].title} id={this.props.tasks[i].id} description={this.props.tasks[i].description} status={this.props.tasks[i].status} onChange={this.props.onChange} onEditStart={this.props.onEditStart} onDelete={this.props.onDelete}/>);
		};
		return <ul className="task-list list-group">
			<h2>Tasks</h2>
			{ tasksObj }
		</ul>
	}
}

// Task item component. Displays a task as an li element, with some interactive elements
class Task extends React.Component {
	constructor() {
		super();
		this.handleStatusChange = this.handleStatusChange.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleEditStart = this.handleEditStart.bind(this);
	}
	//Invert status
	handleStatusChange(e) {
		this.props.onChange({
			'id': this.props.id,
			'status': !this.props.status,
			'title': this.props.title,
			'description': this.props.description
		});
	}
	//Delete task
	handleDelete(e) {
		this.props.onDelete(this.getTask());
	}
	//Start editing task
	handleEditStart(e) {
		this.props.onEditStart(this.getTask());
	}
	//Get task object
	getTask() {
		return {
			'id': this.props.id,
			'status': this.props.status,
			'title': this.props.title,
			'description': this.props.description
		};
	}
	render() {
		//A bit hacky way to set classes, didn't want to include extra libraries
		var activeClass = this.props.active ? 'active' : '';
		var classes = "task tasks-" + this.props.id + " list-group-item " + activeClass;
		return <li className={classes}>
			<input className="status" type="checkbox" checked={this.props.status} onChange={this.handleStatusChange}/> 
			<span className="title">{this.props.title}</span> 
			<span className="description">{this.props.description}</span>
			<nav className="actions">
				<button className="delete btn btn-default" onClick={this.handleDelete}>Delete</button>
				<button className="edit btn btn-primary" onClick={this.handleEditStart}>Edit</button>
			</nav>
		</li>
	}
}

// Task editor component. Displays a form for editing a task object
class TaskEditor extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	//Change
	handleChange(e) {
		var newTask = this.props.task;
		newTask[e.target.name] = e.target.type == "checkbox" ? e.target.checked : e.target.value;
		this.props.onChange(newTask);
	}
	//Save changes
	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit(this.props.task);
		this.props.onComplete();
	}
	render() {
		var task = this.props.task ? this.props.task : {'id': undefined, 'status': false, 'title': '', 'description': ''};
		return <form className="form-inline" onSubmit={this.handleSubmit}>
			<div className="form-group">
				<input className="id form-control" name="id" type="hidden" checked={task.id}/>
				<input className="status form-control" name="status" type="checkbox" checked={task.status} onChange={this.handleChange}/>
				<input className="title form-control" name="title" type="text" placeholder="Title" value={task.title} onChange={this.handleChange}/>
				<input className="description form-control" name="description" type="text" placeholder="Description" value={task.description} onChange={this.handleChange}/>
				<button className="create btn btn-primary form-control">{task.id === undefined ? 'Add' : 'Save'}</button>
			</div>
		</form>
	}
}

ReactDOM.render(<TodoApp url={api}/>, document.getElementById('todo-app'));
