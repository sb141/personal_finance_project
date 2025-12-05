<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// Parse the Request URL
// We assume .htaccess rewrites everything to api.php?path=... OR we parse REQUEST_URI directly
// Let's rely on REQUEST_URI to be robust.

$request_method = $_SERVER['REQUEST_METHOD'];
$base_path = dirname($_SERVER['SCRIPT_NAME']);
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove query string if any (parsed above) and trim slashes
// If script is at /api.php, and request is /transactions, we want to match 'transactions'
// But if using .htaccess rewrite to root, valid requests look like /transactions

// Quick heuristic: checks if string ends with specific keywords
function isRoute($path, $route) {
    // Check if path equals route (ignoring trailing slash)
    $clean_path = rtrim($path, '/');
    $clean_route = rtrim($route, '/');
    
    // Check simple match
    if (str_ends_with($clean_path, $clean_route)) {
        return true;
    }
    return false;
}

// Extract ID from path if present (e.g. /transactions/15)
function getIdFromPath($path) {
    preg_match('/transactions\/(\d+)/', $path, $matches);
    return isset($matches[1]) ? (int)$matches[1] : null;
}

// ---------------------------------------------------------
// ROUTER LOGIC
// ---------------------------------------------------------

// 1. GET /transactions/
if ($request_method === 'GET' && strpos($path, '/transactions') !== false && !getIdFromPath($path)) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $skip = isset($_GET['skip']) ? (int)$_GET['skip'] : 0;
    
    $where = [];
    $params = [];
    
    // Date filter (YYYY-MM-DD)
    if (isset($_GET['date']) && !empty($_GET['date'])) {
        $where[] = "date = ?";
        $params[] = $_GET['date'];
    } 
    // Month/Year filter
    elseif (isset($_GET['year']) && isset($_GET['month'])) {
        $year = (int)$_GET['year'];
        $month = (int)$_GET['month'];
        $where[] = "YEAR(date) = ? AND MONTH(date) = ?";
        $params[] = $year;
        $params[] = $month;
    }
    
    $sql = "SELECT * FROM transactions";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY date DESC LIMIT $limit OFFSET $skip";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 2. POST /transactions/
if ($request_method === 'POST' && strpos($path, '/transactions') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Basic validation
    if (!isset($input['amount']) || !isset($input['date']) || !isset($input['type'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $sql = "INSERT INTO transactions (date, amount, type, category, description) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['date'],
        $input['amount'],
        $input['type'],
        isset($input['category']) ? $input['category'] : '',
        isset($input['description']) ? $input['description'] : ''
    ]);
    
    $id = $pdo->lastInsertId();
    $input['id'] = $id;
    echo json_encode($input);
    exit;
}

// 3. PUT /transactions/{id}
if ($request_method === 'PUT' && ($id = getIdFromPath($path))) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // We need to build a dynamic update query
    $fields = [];
    $params = [];
    
    foreach (['date', 'amount', 'type', 'category', 'description'] as $col) {
        if (isset($input[$col])) {
            $fields[] = "$col = ?";
            $params[] = $input[$col];
        }
    }
    
    if (empty($fields)) {
        echo json_encode(['message' => 'No fields to update']);
        exit;
    }
    
    $sql = "UPDATE transactions SET " . implode(", ", $fields) . " WHERE id = ?";
    $params[] = $id;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Return updated
    $input['id'] = $id;
    echo json_encode($input);
    exit;
}

// 4. DELETE /transactions/{id}
if ($request_method === 'DELETE' && ($id = getIdFromPath($path))) {
    $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Deleted successfully', 'id' => $id]);
    exit;
}

// 5. GET /reports/weekly
if ($request_method === 'GET' && strpos($path, '/reports/weekly') !== false) {
    // Last 7 days
    $stmt = $pdo->query("
        SELECT date, type, amount 
        FROM transactions 
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ");
    $results = $stmt->fetchAll();
    
    $report = []; // Keyed by date
    foreach ($results as $row) {
        $date = $row['date'];
        if (!isset($report[$date])) {
            $report[$date] = ['date' => $date, 'credit' => 0, 'debit' => 0];
        }
        if ($row['type'] == 'credit') $report[$date]['credit'] += (float)$row['amount'];
        if ($row['type'] == 'debit') $report[$date]['debit'] += (float)$row['amount'];
    }
    
    echo json_encode(array_values($report));
    exit;
}

// 6. GET /reports/monthly
if ($request_method === 'GET' && strpos($path, '/reports/monthly') !== false) {
    $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
    $month = isset($_GET['month']) ? (int)$_GET['month'] : date('m');
    
    $stmt = $pdo->prepare("
        SELECT date, type, amount 
        FROM transactions 
        WHERE YEAR(date) = ? AND MONTH(date) = ?
    ");
    $stmt->execute([$year, $month]);
    $results = $stmt->fetchAll();
    
    $report = []; 
    foreach ($results as $row) {
        $date = $row['date'];
        if (!isset($report[$date])) {
            $report[$date] = ['date' => $date, 'credit' => 0, 'debit' => 0];
        }
        if ($row['type'] == 'credit') $report[$date]['credit'] += (float)$row['amount'];
        if ($row['type'] == 'debit') $report[$date]['debit'] += (float)$row['amount'];
    }
    
    echo json_encode(array_values($report));
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
?>
