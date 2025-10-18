<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(Request $request)
    {
        try {
            $query = Department::whereNull('deleted_at');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('department_name', 'like', "%{$search}%")
                      ->orWhere('department_head', 'like', "%{$search}%");
                });
            }

            $departments = $query->orderBy('created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $departments,
                'message' => 'Departments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving departments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'department_name' => 'required|string|max:255|unique:departments,department_name',
                'department_head' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = Department::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Department created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified department.
     */
    public function show($id)
    {
        try {
            $department = Department::whereNull('deleted_at')->find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Department retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, $id)
    {
        try {
            $department = Department::whereNull('deleted_at')->find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found or could not be updated'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'department_name' => 'required|string|max:255|unique:departments,department_name,' . $id . ',department_id',
                'department_head' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Department updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified department (soft delete).
     */
    public function destroy($id)
    {
        try {
            $department = Department::whereNull('deleted_at')->find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found or could not be deleted'
                ], 404);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department archived successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving department: ' . $e->getMessage()
            ], 500);
        }
    }
}