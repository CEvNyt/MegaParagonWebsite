<?php
// Shared server-side portal proxy. Secrets are never returned to the browser.
declare(strict_types=1);

function fail_request(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode(['message' => $message]);
    exit;
}

function portal_request(string $type): void
{
    $routes = [
        'join' => ['POST', 'JOIN_TEAM_ENDPOINT', 'JOIN_TEAM_API_KEY'],
        'inquiry' => ['POST', 'INQUIRIES_ENDPOINT', 'INQUIRIES_API_KEY'],
        'announcements' => ['GET', 'ANNOUNCEMENTS_ENDPOINT', 'ANNOUNCEMENTS_API_KEY'],
    ];
    [$method, $endpointName, $keyName] = $routes[$type];
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        fail_request(405, 'Method not allowed.');
    }

    // Prefer .env outside the deployed website. The root fallback is protected by .htaccess.
    $root = dirname(__DIR__);
    $values = [];
    foreach ([dirname($root) . '/.env', $root . '/.env'] as $envPath) {
        if (!is_readable($envPath)) continue;
        foreach (file($envPath, FILE_IGNORE_NEW_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
            [$name, $value] = explode('=', $line, 2);
            $values[trim($name)] = trim(trim($value), "\"'");
        }
        break;
    }
    $endpoint = trim(getenv($endpointName) ?: ($values[$endpointName] ?? ''));
    $key = trim(getenv($keyName) ?: ($values[$keyName] ?? ''));
    if ($endpoint === '' || $key === '') fail_request(503, 'Portal connection is not configured.');
    if (!filter_var($endpoint, FILTER_VALIDATE_URL) || parse_url($endpoint, PHP_URL_SCHEME) !== 'https') {
        fail_request(503, 'Portal endpoint must be a valid HTTPS URL.');
    }
    if (!function_exists('curl_init')) fail_request(503, 'PHP cURL must be enabled on the host.');
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 10 * 1024 * 1024) fail_request(413, 'Submission exceeds the 10 MB limit.');

    $headers = ['Accept: application/json', 'X-API-Key: ' . $key];
    $body = null;
    if ($type === 'join') {
        // PHP parses multipart fields. cURL creates a new boundary for optional CV uploads.
        $body = [];
        foreach ($_POST as $name => $value) {
            if (!is_string($value)) fail_request(422, 'Invalid form field.');
            $body[$name === 'name' ? 'full_name' : $name] = $value;
        }
        foreach ($_FILES as $name => $upload) {
            if ($name !== 'cv') fail_request(422, 'Unsupported file field.');
            if (is_array($upload['error'])) fail_request(422, 'Invalid CV upload.');
            if ($upload['error'] === UPLOAD_ERR_NO_FILE) continue;
            if ($upload['error'] === UPLOAD_ERR_INI_SIZE || $upload['error'] === UPLOAD_ERR_FORM_SIZE) fail_request(413, 'CV exceeds the server upload limit.');
            if ($upload['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($upload['tmp_name'])) fail_request(422, 'CV upload failed.');
            $extension = strtolower(pathinfo($upload['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, ['pdf', 'doc', 'docx'], true)) fail_request(422, 'Upload a PDF, DOC or DOCX CV.');
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($upload['tmp_name']);
            $body['cv'] = new CURLFile($upload['tmp_name'], $mime ?: 'application/octet-stream', basename($upload['name']));
        }
    } elseif ($type === 'inquiry') {
        $body = file_get_contents('php://input');
        $decoded = json_decode($body);
        if (!is_object($decoded) || json_last_error() !== JSON_ERROR_NONE) fail_request(400, 'Invalid JSON submission.');
        $headers[] = 'Content-Type: application/json';
    }

    $curl = curl_init($endpoint);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    if ($method === 'POST') {
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    }
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ($response === false || $status === 0) fail_request(502, 'Unable to connect to the portal. Please try again later.');
    // Never return a portal HTML error page to the form UI.
    $decoded = json_decode($response);
    if ($status >= 300 && $status < 400) fail_request(502, 'The portal endpoint returned a redirect. Check its configured URL.');
    if (json_last_error() !== JSON_ERROR_NONE) fail_request(502, 'The portal returned an unexpected response. Check its configured URL.');
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo $response;
}
