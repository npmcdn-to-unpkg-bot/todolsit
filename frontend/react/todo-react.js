var api = '/api/php/task/';
//var api = 'http://localhost:8080/task/';

// Main Todo app component, handles api communication and main state
class TodoApp extends React.Component {
	constructor() {
		super();
		this.state = {'tasks': {}};
		this.handleTaskSubmit = this.handleTaskSubmit.bind(this);
		this.handleStatusChange = this.handleStatusChange.bind(this);
	}
	componentDidMount() {
		this.getTasks();
	}
	handleTaskSubmit(task) {
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
	handleStatusChange(task) {
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
	}
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
		return <div className="todo-app">
			<TaskList tasks={this.state.tasks} onStatusChange={this.handleStatusChange}/>
			<TaskEditor onTaskSubmit={this.handleTaskSubmit}/>
		</div>
	}
}

// Task list component. Displays an unordered list of tasks
class TaskList extends React.Component {
	render() {
		var tasksObj = [];
		for(var i in this.props.tasks) {
			tasksObj.push(<Task key={this.props.tasks[i].id} title={this.props.tasks[i].title} id={this.props.tasks[i].id} description={this.props.tasks[i].description} status={this.props.tasks[i].status} onStatusChange={this.props.onStatusChange}/>);
		};
		return <ul className="task-list">
			<h2>List</h2>
			{ tasksObj }
		</ul>
	}
}

// Task item component. Displays a task as an li element, with interactive checkbox
class Task extends React.Component {
	constructor() {
		super();
		this.handleStatusChange = this.handleStatusChange.bind(this);
	}
	handleStatusChange(e) {
		this.props.onStatusChange({
			'id': this.props.id,
			'status': !this.props.status,
			'title': this.props.title,
			'description': this.props.description
		});
	}
	render() {
		return <li className="task task-{this.props.id}">
			<input className="status" type="checkbox" checked={this.props.status} onChange={this.handleStatusChange}/> 
			<span className="title">{this.props.title}</span> 
			<span className="description">{this.props.description}</span>
		</li>
	}
}

// Task editor component. Displays a form for creating new task
// Todo: Enable editing of existing tasks, and deletion
class TaskEditor extends React.Component {
	constructor() {
		super();
		this.state = { 
			'id': undefined,
			'title': '',
			'description': '',
			'status': false
		};
		this.handleStatusChange = this.handleStatusChange.bind(this);
		this.handleTitleChange = this.handleTitleChange.bind(this);
		this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleStatusChange(e) {
		this.setState({ 'status': e.target.checked });
	}
	handleTitleChange(e) {
		this.setState({ 'title': e.target.value });
	}
	handleDescriptionChange(e) {
		this.setState({ 'description': e.target.value });
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.onTaskSubmit({
			'id': this.state.id,
			'status': this.state.status,
			'title': this.state.title,
			'description': this.state.description
		});
		this.setState({
			'id': undefined,
			'title': '',
			'description': '',
			'status': false
		});
	}
	render() {
		return <form className="form" onSubmit={this.handleSubmit}>
			<input className="status" type="checkbox" checked={this.state.status} onChange={this.handleStatusChange}/>
			<input className="title" type="text" placeholder="Title" value={this.state.title} onChange={this.handleTitleChange}/>
			<input className="description" type="text" placeholder="Description" value={this.state.description} onChange={this.handleDescriptionChange}/>
			<button className="create">Add</button>
		</form>
	}
}

ReactDOM.render(<TodoApp url={api}/>, document.getElementById('todo-app'));
