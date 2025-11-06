<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExcelController extends Controller
{
    public function exportSample()
    {
        // Sample data for demonstration
        $data = [
            ['John Doe', 'Student', 'Computer Science', '2023-01-01', '2023-06-30', 'Good progress'],
            ['Jane Smith', 'Faculty', 'Engineering', '2023-02-01', '2023-07-31', 'Excellent performance'],
            ['Bob Johnson', 'Student', 'Mathematics', '2023-03-01', '2023-08-31', 'Needs improvement']
        ];
        
        $headers = ['Name', 'Type', 'Department', 'Start Date', 'End Date', 'Comments'];
        
        // Create CSV content
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, $headers);
            
            // Add data rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        // Generate response with CSV content
        $filename = 'sample_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        return Response::stream($callback, 200, $headers);
    }
}