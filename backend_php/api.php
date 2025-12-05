<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// Parse Request
$request_method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Helper functions
function getIdFromPath($path) {
    preg_match('/transactions\/(\d+)/', $path, $matches);
    return isset($matches[1]) ? (int)$matches[1] : null;
}

// Authentication Middleware
function authenticate($pdo) {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Support non-Apache execution environments where getallheaders() might be missing
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE api_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            return $user;
        }
    }
    
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ---------------------------------------------------------
// PUBLIC ROUTES (No Auth Required)
// ---------------------------------------------------------


// 1. POST /auth/register
if ($request_method === 'POST' && strpos($path, '/auth/register') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['detail' => 'Missing username or password']);
        exit;
    }



    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['detail' => 'Username already taken']);
        exit;
    }

    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        $stmt->execute([$input['username'], $password_hash]);
        echo json_encode(['message' => 'User registered successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['detail' => 'Registration failed']);
    }
    exit;
}

// 2. POST /auth/login
if ($request_method === 'POST' && strpos($path, '/auth/login') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($input['password'], $user['password_hash'])) {
        // Generate new token (simple random string for shared hosting compatibility)
        $token = bin2hex(random_bytes(32));
        
        // Update user token
        $update = $pdo->prepare("UPDATE users SET api_token = ? WHERE id = ?");
        $update->execute([$token, $user['id']]);
        
        echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['detail' => 'Invalid credentials']);
    }
    exit;
}

// ---------------------------------------------------------
// PROTECTED ROUTES (Auth Required)
// ---------------------------------------------------------

// Require authentication for everything below
$currentUser = authenticate($pdo);

// 3. GET /transactions/
if ($request_method === 'GET' && strpos($path, '/transactions') !== false && !getIdFromPath($path)) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    $where = ['user_id = ?'];
    $params = [$currentUser['id']];
    
    if (isset($_GET['date']) && !empty($_GET['date'])) {
        $where[] = "date = ?";
        $params[] = $_GET['date'];
    } elseif (isset($_GET['year']) && isset($_GET['month'])) {
        $where[] = "YEAR(date) = ? AND MONTH(date) = ?";
        $params[] = (int)$_GET['year'];
        $params[] = (int)$_GET['month'];
    }
    
    $sql = "SELECT * FROM transactions WHERE " . implode(" AND ", $where);
    $sql .= " ORDER BY date DESC LIMIT $limit";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 4. POST /transactions/
if ($request_method === 'POST' && strpos($path, '/transactions') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, date, amount, type, category, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $currentUser['id'],
        $input['date'],
        $input['amount'],
        $input['type'],
        isset($input['category']) ? $input['category'] : '',
        isset($input['description']) ? $input['description'] : ''
    ]);
    
    $input['id'] = $pdo->lastInsertId();
    echo json_encode($input);
    exit;
}

// 5. UPDATE /transactions/{id}
if ($request_method === 'PUT' && ($id = getIdFromPath($path))) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $fields = [];
    $params = [];
    foreach (['date', 'amount', 'type', 'category', 'description'] as $col) {
        if (isset($input[$col])) {
            $fields[] = "$col = ?";
            $params[] = $input[$col];
        }
    }
    
    if (!empty($fields)) {
        $sql = "UPDATE transactions SET " . implode(", ", $fields) . " WHERE id = ? AND user_id = ?";
        $params[] = $id;
        $params[] = $currentUser['id'];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    
    $input['id'] = $id;
    echo json_encode($input);
    exit;
}

// 6. DELETE /transactions/{id}
if ($request_method === 'DELETE' && ($id = getIdFromPath($path))) {
    $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $currentUser['id']]);
    echo json_encode(['message' => 'Deleted successfully']);
    exit;
}

// 7. GET /reports/weekly
if ($request_method === 'GET' && strpos($path, '/reports/weekly') !== false) {
    $stmt = $pdo->prepare("SELECT date, type, amount FROM transactions WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    $stmt->execute([$currentUser['id']]);
    echo json_encode(processReports($stmt->fetchAll()));
    exit;
}

// 8. GET /reports/monthly
if ($request_method === 'GET' && strpos($path, '/reports/monthly') !== false) {
    $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
    $month = isset($_GET['month']) ? (int)$_GET['month'] : date('m');
    $stmt = $pdo->prepare("SELECT date, type, amount FROM transactions WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?");
    $stmt->execute([$currentUser['id'], $year, $month]);
    echo json_encode(processReports($stmt->fetchAll()));
    exit;
}

function processReports($results) {
    $report = [];
    foreach ($results as $row) {
        $date = $row['date'];
        if (!isset($report[$date])) $report[$date] = ['date' => $date, 'credit' => 0, 'debit' => 0];
        if ($row['type'] == 'credit') $report[$date]['credit'] += (float)$row['amount'];
        if ($row['type'] == 'debit') $report[$date]['debit'] += (float)$row['amount'];
    }
    return array_values($report);
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
?>
