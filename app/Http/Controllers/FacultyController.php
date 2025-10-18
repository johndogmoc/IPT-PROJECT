<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculty.
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('faculty_profiles')
                ->leftJoin('departments', 'faculty_profiles.department_id', '=', 'departments.department_id')
                ->whereNull('faculty_profiles.deleted_at')
                ->select(
                    'faculty_profiles.*',
                    'departments.department_name'
                );

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('faculty_profiles.f_name', 'like', "%{$search}%")
                      ->orWhere('faculty_profiles.l_name', 'like', "%{$search}%")
                      ->orWhere('faculty_profiles.email_address', 'like', "%{$search}%")
                      ->orWhere('faculty_profiles.phone_number', 'like', "%{$search}%");
                });
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('faculty_profiles.department_id', $request->department_id);
            }

            // Filter by position
            if ($request->has('position') && $request->position) {
                $query->where('faculty_profiles.position', 'like', "%{$request->position}%");
            }

            $faculty = $query->orderBy('faculty_profiles.created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created faculty.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'f_name' => 'required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'required|string|max:255',
                'suffix' => 'nullable|string|max:255',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:Male,Female',
                'phone_number' => 'required|string|max:255',
                'email_address' => 'required|email|unique:faculty_profiles,email_address',
                'address' => 'required|string',
                'position' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $facultyId = DB::table('faculty_profiles')->insertGetId([
                'f_name' => $request->f_name,
                'm_name' => $request->m_name,
                'l_name' => $request->l_name,
                'suffix' => $request->suffix,
                'date_of_birth' => $request->date_of_birth,
                'sex' => $request->sex,
                'phone_number' => $request->phone_number,
                'email_address' => $request->email_address,
                'address' => $request->address,
                'position' => $request->position,
                'department_id' => $request->department_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $faculty = DB::table('faculty_profiles')
                ->leftJoin('departments', 'faculty_profiles.department_id', '=', 'departments.department_id')
                ->where('faculty_profiles.faculty_id', $facultyId)
                ->select(
                    'faculty_profiles.*',
                    'departments.department_name'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified faculty.
     */
    public function show($id)
    {
        try {
            $faculty = DB::table('faculty_profiles')
                ->leftJoin('departments', 'faculty_profiles.department_id', '=', 'departments.department_id')
                ->where('faculty_profiles.faculty_id', $id)
                ->whereNull('faculty_profiles.deleted_at')
                ->select(
                    'faculty_profiles.*',
                    'departments.department_name'
                )
                ->first();

            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified faculty.
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'f_name' => 'required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'required|string|max:255',
                'suffix' => 'nullable|string|max:255',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:Male,Female',
                'phone_number' => 'required|string|max:255',
                'email_address' => ['required', 'email', Rule::unique('faculty_profiles', 'email_address')->ignore($id, 'faculty_id')],
                'address' => 'required|string',
                'position' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = DB::table('faculty_profiles')
                ->where('faculty_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'f_name' => $request->f_name,
                    'm_name' => $request->m_name,
                    'l_name' => $request->l_name,
                    'suffix' => $request->suffix,
                    'date_of_birth' => $request->date_of_birth,
                    'sex' => $request->sex,
                    'phone_number' => $request->phone_number,
                    'email_address' => $request->email_address,
                    'address' => $request->address,
                    'position' => $request->position,
                    'department_id' => $request->department_id,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty not found or could not be updated'
                ], 404);
            }

            $faculty = DB::table('faculty_profiles')
                ->leftJoin('departments', 'faculty_profiles.department_id', '=', 'departments.department_id')
                ->where('faculty_profiles.faculty_id', $id)
                ->select(
                    'faculty_profiles.*',
                    'departments.department_name'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Faculty updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified faculty (soft delete).
     */
    public function destroy($id)
    {
        try {
            $deleted = DB::table('faculty_profiles')
                ->where('faculty_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now()
                ]);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty not found or could not be deleted'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Faculty deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown data for forms.
     */
    public function getDropdownData()
    {
        try {
            $departments = DB::table('departments')
                ->whereNull('deleted_at')
                ->select('department_id', 'department_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'departments' => $departments
                ],
                'message' => 'Dropdown data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dropdown data: ' . $e->getMessage()
            ], 500);
        }
    }
}