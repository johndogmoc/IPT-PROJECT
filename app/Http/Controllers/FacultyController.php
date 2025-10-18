<?php

namespace App\Http\Controllers;

use App\Models\FacultyProfile;
use App\Models\Department;
use Illuminate\Http\Request;
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
            $query = FacultyProfile::with('department')->whereNull('deleted_at');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('f_name', 'like', "%{$search}%")
                      ->orWhere('l_name', 'like', "%{$search}%")
                      ->orWhere('email_address', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('department_id', $request->department_id);
            }

            // Filter by position
            if ($request->has('position') && $request->position) {
                $query->where('position', 'like', "%{$request->position}%");
            }

            $faculty = $query->orderBy('created_at', 'desc')->paginate(10);

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
                'suffix' => 'nullable|string|max:50',
                'date_of_birth' => 'required|date',
                'sex' => ['required', Rule::in(['Male', 'Female'])],
                'phone_number' => 'required|string|max:255|unique:faculty_profiles,phone_number',
                'email_address' => 'required|email|max:255|unique:faculty_profiles,email_address',
                'address' => 'required|string|max:255',
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

            $faculty = FacultyProfile::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $faculty->load('department'),
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
            $faculty = FacultyProfile::with('department')->whereNull('deleted_at')->find($id);

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
            $faculty = FacultyProfile::whereNull('deleted_at')->find($id);

            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty not found or could not be updated'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'f_name' => 'sometimes|required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'sometimes|required|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'date_of_birth' => 'sometimes|required|date',
                'sex' => ['sometimes', 'required', Rule::in(['Male', 'Female'])],
                'phone_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('faculty_profiles')->ignore($id, 'faculty_id')],
                'email_address' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('faculty_profiles')->ignore($id, 'faculty_id')],
                'address' => 'sometimes|required|string|max:255',
                'position' => 'sometimes|required|string|max:255',
                'department_id' => 'sometimes|required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $faculty->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $faculty->load('department'),
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
            $faculty = FacultyProfile::whereNull('deleted_at')->find($id);

            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty not found or could not be deleted'
                ], 404);
            }

            $faculty->delete();

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
            $departments = Department::whereNull('deleted_at')->select('department_id', 'department_name')->get();

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