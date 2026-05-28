<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api/clients(?:/(\d+))?$#', $uri, $m)) {
    $_GET['id'] = $m[1] ?? null;
    require __DIR__ . '/api/clients.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}