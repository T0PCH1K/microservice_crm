<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $client = db_fetch_one("SELECT * FROM clients WHERE id = $id");
            if ($client) {
                echo json_encode($client);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Client not found']);
            }
        } else {
            $clients = db_fetch_all("SELECT id, name, email, phone, telegram, balance, created_at, updated_at FROM clients ORDER BY id DESC");
            echo json_encode($clients);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $name     = db_escape($input['name'] ?? '');
        $email    = db_escape($input['email'] ?? '');
        $phone    = db_escape($input['phone'] ?? '');
        $telegram = db_escape($input['telegram'] ?? '');
        $balance  = floatval($input['balance'] ?? 0);

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit;
        }

        $sql = "INSERT INTO clients (name, email, phone, telegram, balance) VALUES ('$name', '$email', '$phone', '$telegram', $balance)";
        $result = db_execute($sql);
        $client = db_fetch_one("SELECT * FROM clients WHERE id = {$result['insert_id']}");
        http_response_code(201);
        echo json_encode($client);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        if (isset($input['name']))     $fields[] = "name = '"     . db_escape($input['name'])     . "'";
        if (isset($input['email']))    $fields[] = "email = '"    . db_escape($input['email'])    . "'";
        if (isset($input['phone']))    $fields[] = "phone = '"    . db_escape($input['phone'])    . "'";
        if (isset($input['telegram'])) $fields[] = "telegram = '" . db_escape($input['telegram']) . "'";
        if (isset($input['balance']))  $fields[] = "balance = "   . floatval($input['balance']);

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        db_execute("UPDATE clients SET " . implode(', ', $fields) . " WHERE id = $id");
        $client = db_fetch_one("SELECT * FROM clients WHERE id = $id");
        echo json_encode($client);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }
        db_execute("DELETE FROM clients WHERE id = $id");
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}