<?php

namespace App\Exports;

use Illuminate\Support\Facades\Response;

class ReportsExport
{
    protected $data;
    protected $headers;

    public function __construct(array $data, array $headers = [])
    {
        $this->data = $data;
        $this->headers = $headers;
    }

    public function export($filename = 'reports')
    {
        $data = $this->data;
        $headers = $this->headers;
        
        // Create CSV content using native PHP
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add headers if provided
            if (!empty($headers)) {
                fputcsv($file, $headers);
            }
            
            // Add data rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        // Generate response with CSV content
        $filename = $filename . '_' . date('Y-m-d') . '.csv';
        $httpHeaders = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];
        
        return Response::stream($callback, 200, $httpHeaders);
    }
}