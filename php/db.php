<?php
require_once __DIR__ . '/cfg.php';

function db_connect() {
    $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    mysqli_set_charset($conn, 'utf8mb4');
    return $conn;
}

function db_fetch_all($sql) {
    $conn = db_connect();
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        mysqli_close($conn);
        return [];
    }
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    mysqli_free_result($result);
    mysqli_close($conn);
    return $rows;
}

function db_fetch_one($sql) {
    $rows = db_fetch_all($sql);
    return $rows[0] ?? null;
}

function db_execute($sql) {
    $conn = db_connect();
    $result = mysqli_query($conn, $sql);
    $insertId = mysqli_insert_id($conn);
    $affected = mysqli_affected_rows($conn);
    mysqli_close($conn);
    return [
        'success' => $result !== false,
        'insert_id' => $insertId,
        'affected_rows' => $affected
    ];
}

function db_escape($value) {
    $conn = db_connect();
    $escaped = mysqli_real_escape_string($conn, $value);
    mysqli_close($conn);
    return $escaped;
}