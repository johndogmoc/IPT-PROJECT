<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Exports\ReportsExport;

class ReportController extends Controller
{
    // Storage file path
    private $storageFile;
    private $reports = [];
    
    public function __construct()
    {
        // Use storage path for persistent data
        $this->storageFile = storage_path('app/reports.json');
        
        // Load reports from file
        if (file_exists($this->storageFile)) {
            $contents = file_get_contents($this->storageFile);
            $this->reports = json_decode($contents, true) ?: [];
        } else {
            $this->reports = [];
            $this->saveReports();
        }
    }
    
    private function saveReports()
    {
        // Ensure directory exists
        $directory = dirname($this->storageFile);
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        // Save to file
        file_put_contents($this->storageFile, json_encode($this->reports, JSON_PRETTY_PRINT));
    }
    
    public function clearSession()
    {
        $this->reports = [];
        $this->saveReports();
        return response()->json([
            'success' => true,
            'message' => 'Reports cleared successfully'
        ]);
    }

    public function index(Request $request)
    {
        // Return all reports without filtering by type
        return response()->json(array_values($this->reports));
    }

    public function store(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'reportType' => 'required|in:general,student,faculty',
            'title' => 'required|string|max:255',
            'targetName' => 'required|string|max:255',
            'dateFrom' => 'required|date',
            'dateTo' => 'required|date|after_or_equal:dateFrom',
            'status' => 'nullable|in:pending,in-progress,completed',
            'description' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Create new report
        $newId = count($this->reports) > 0 ? max(array_column($this->reports, 'id')) + 1 : 1;
        $newReport = array_merge($request->all(), [
            'id' => $newId,
            'status' => $request->input('status', 'pending'),
            'createdAt' => date('Y-m-d')
        ]);
        
        $this->reports[] = $newReport;
        $this->saveReports();
        
        return response()->json([
            'success' => true,
            'message' => 'Report created successfully',
            'data' => $newReport
        ]);
    }
    
    public function show($id)
    {
        // Find report by ID
        $report = null;
        foreach ($this->reports as $r) {
            if ($r['id'] == $id) {
                $report = $r;
                break;
            }
        }
        
        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }
        
        return response()->json($report);
    }
    
    public function update(Request $request, $id)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'reportType' => 'required|in:general,student,faculty',
            'title' => 'required|string|max:255',
            'targetName' => 'required|string|max:255',
            'dateFrom' => 'required|date',
            'dateTo' => 'required|date|after_or_equal:dateFrom',
            'status' => 'required|in:pending,in-progress,completed',
            'description' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Find and update report
        $updated = false;
        foreach ($this->reports as $key => $report) {
            if ($report['id'] == $id) {
                $this->reports[$key] = array_merge($report, $request->all());
                $updated = true;
                break;
            }
        }
        
        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }
        
        $this->saveReports();
        
        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully',
            'data' => array_merge($request->all(), ['id' => $id])
        ]);
    }
    
    public function destroy($id)
    {
        // Find and remove report
        $initialCount = count($this->reports);
        $this->reports = array_filter($this->reports, function($report) use ($id) {
            return $report['id'] != $id;
        });
        
        if (count($this->reports) === $initialCount) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }
        
        $this->saveReports();
        
        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully'
        ]);
    }
    
    public function export(Request $request)
    {
        // Get report ID and type if provided
        $reportId = $request->query('id');
        $reportType = $request->query('type');
        
        // Filter reports for export
        $reportsToExport = $this->reports;
        
        // If specific report ID is provided, filter to that report only
        if ($reportId) {
            $reportsToExport = array_filter($reportsToExport, function($report) use ($reportId) {
                return $report['id'] == $reportId;
            });
        }
        // If report type is provided, filter by type
        elseif ($reportType) {
            $reportsToExport = array_filter($reportsToExport, function($report) use ($reportType) {
                return $report['reportType'] == $reportType;
            });
        }
        
        // Prepare data for export
        $data = [];
        $headers = ['Report Type', 'Title', 'Target Name', 'Date From', 'Date To', 'Status', 'Description', 'Findings', 'Recommendations'];
        
        foreach ($reportsToExport as $report) {
            $data[] = [
                ucfirst($report['reportType']),
                $report['title'],
                $report['targetName'],
                $report['dateFrom'],
                $report['dateTo'],
                $report['status'],
                $report['description'] ?? '',
                $report['findings'] ?? '',
                $report['recommendations'] ?? ''
            ];
        }
        
        // Create filename based on export type
        $filename = $reportId ? 'report_' . $reportId : 'reports_all';
        
        // Create and return export
        $exporter = new ReportsExport($data, $headers);
        return $exporter->export($filename);
    }
}