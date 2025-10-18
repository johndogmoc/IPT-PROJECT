<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('departments')
                ->whereNull('deleted_at')
                ->select('*');

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

            $departmentId = DB::table('departments')->insertGetId([
                'department_name' => $request->department_name,
                'department_head' => $request->department_head,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $department = DB::table('departments')
                ->where('department_id', $departmentId)
                ->first();

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
            $department = DB::table('departments')
                ->where('department_id', $id)
                ->whereNull('deleted_at')
                ->first();

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

            $updated = DB::table('departments')
                ->where('department_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'department_name' => $request->department_name,
                    'department_head' => $request->department_head,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found or could not be updated'
                ], 404);
            }

            $department = DB::table('departments')
                ->where('department_id', $id)
                ->first();

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
            $deleted = DB::table('departments')
                ->where('department_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now()
                ]);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found or could not be deleted'
                ], 404);
            }

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