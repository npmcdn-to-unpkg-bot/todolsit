<?php
header('Content-Type: application/json');

require __DIR__ . '/vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$resource = '';
$id = '';
$requestData = json_decode(file_get_contents('php://input'));

// Try to detect what resource (and id) we are working with
$path = explode("/", $requestUri);
if(ctype_digit($path[count($path) - 1]) || $path[count($path) - 1] == '') {
	$id = array_pop($path);
}
$resource = array_pop($path);

// Switch to the appropriate handler for the resource
switch ($resource) {
	case 'task':
		$apiHandler = new taskApi();
		break;
	
	default:
		die();
		break;
}

// Call methods based on request type
switch ($method) {
	case 'GET':
		$apiHandler->get($id);
		break;
	case 'POST':
		$apiHandler->post($requestData);
		break;
	case 'PUT':
		$apiHandler->put($id, $requestData);
		break;
	case 'DELETE':
		$apiHandler->delete($id);
		break;
	default:
		die();
		break;
}

// Basic task api class
class taskApi {
	private $conn; 

	function __construct() {
		$config = new \Doctrine\DBAL\Configuration();
		$connectionParams = array(
			'path' => '../../db/todo.sqlite',
			'user' => '',
			'password' => '',
			'host' => 'localhost',
			'driver' => 'pdo_sqlite',
		);
		$this->conn = \Doctrine\DBAL\DriverManager::getConnection($connectionParams, $config);
	}

	public function get($id = '') {
		if($id == '') {
			$tasks = $this->conn->fetchAll('SELECT * FROM task');
		} else {
			$tasks = Array($this->conn->fetchAssoc('SELECT * from task WHERE id = ?', array($id)));
		}

		if(count($tasks) > 0 && $tasks[0] != false) {
			echo json_encode($tasks);
			http_response_code(200);
		} else {
			echo "{}";
			http_response_code(404);
		}
	}

	public function post($requestData) {
		$result = $this->conn->insert('task', array(
			'title' => $requestData->title,
			'description' => $requestData->description,
			'status' => $requestData->status ? 1 : 0,
		));

		if($result != false) {
			$id = $this->conn->lastInsertId();
			echo json_encode($this->conn->fetchAssoc('SELECT * FROM task WHERE id = ?', array($id)));
			http_response_code(201);
		} else {
			echo "{}";
			http_response_code(500);
		}
	}

	public function put($id, $requestData) {
		$success = $this->conn->update('task', array(
			'title' => $requestData->title,
			'description' => $requestData->description,
			'status' => $requestData->status ? 1 : 0,
		), array('id' => $id));

		if($success) {
			echo json_encode($this->conn->fetchAssoc('SELECT * FROM task WHERE id = ?', array($id)));
			http_response_code(200);
		} else {
			echo "{}";
			http_response_code(304);
		}
	}

	public function delete($id) {
		$success = $this->conn->delete('task', array('id' => $id));

		if($success) {
			http_response_code(200);
		} else {
			http_response_code(404);
		}
		echo "{}";
	}
}
?>
