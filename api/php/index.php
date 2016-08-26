<?php
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$resource = '';
$id = '';

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
		$apiHandler->get();
		break;
	case 'POST':
		$apiHandler->post();
		break;
	case 'PUT':
		$apiHandler->put();
		break;
	case 'DELETE':
		$apiHandler->delete();
		break;
	default:
		die();
		break;
}

// Basic task api class
class taskApi {
	public function get() {
		echo "get";
	}
	public function post() {
		echo "post";
	}
	public function put() {
		echo "put";
	}
	public function delete() {
		echo "delete";
	}
}
?>
