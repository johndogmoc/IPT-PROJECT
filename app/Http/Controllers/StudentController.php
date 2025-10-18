<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        try {
            $query = StudentProfile::with(['department', 'course', 'academicYear'])
                ->whereNull('deleted_at');

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

            // Filter by course
            if ($request->has('course_id') && $request->course_id) {
                $query->where('course_id', $request->course_id);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $students = $query->orderBy('created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $students,
                'message' => 'Students retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving students: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created student.
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
                'phone_number' => 'required|string|max:255|unique:student_profiles,phone_number',
                'email_address' => 'required|email|max:255|unique:student_profiles,email_address',
                'address' => 'required|string|max:255',
                'status' => ['required', Rule::in(['Active', 'Inactive', 'Graduated'])],
                'department_id' => 'required|exists:departments,department_id',
                'course_id' => 'required|exists:courses,course_id',
                'academic_year_id' => 'required|exists:academic_years,academic_year_id',
                'year_level' => 'required|integer|min:1|max:5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student = StudentProfile::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $student->load(['department', 'course', 'academicYear']),
                'message' => 'Student created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student.
     */
    public function show($id)
    {
        try {
            $student = StudentProfile::with(['department', 'course', 'academicYear'])
                ->whereNull('deleted_at')
                ->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $student,
                'message' => 'Student retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, $id)
    {
        try {
            $student = StudentProfile::whereNull('deleted_at')->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found or could not be updated'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'f_name' => 'sometimes|required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'sometimes|required|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'date_of_birth' => 'sometimes|required|date',
                'sex' => ['sometimes', 'required', Rule::in(['Male', 'Female'])],
                'phone_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('student_profiles')->ignore($id, 'student_id')],
                'email_address' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('student_profiles')->ignore($id, 'student_id')],
                'address' => 'sometimes|required|string|max:255',
                'status' => ['sometimes', 'required', Rule::in(['Active', 'Inactive', 'Graduated'])],
                'department_id' => 'sometimes|required|exists:departments,department_id',
                'course_id' => 'sometimes|required|exists:courses,course_id',
                'academic_year_id' => 'sometimes|required|exists:academic_years,academic_year_id',
                'year_level' => 'sometimes|required|integer|min:1|max:5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $student->load(['department', 'course', 'academicYear']),
                'message' => 'Student updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student (soft delete).
     */
    public function destroy($id)
    {
        try {
            $student = StudentProfile::whereNull('deleted_at')->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found or could not be deleted'
                ], 404);
            }

            $student->delete();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting student: ' . $e->getMessage()
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
            $courses = Course::whereNull('deleted_at')->select('course_id', 'course_name', 'department_id')->get();
            $academicYears = AcademicYear::whereNull('deleted_at')->select('academic_year_id', 'school_year')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'departments' => $departments,
                    'courses' => $courses,
                    'academic_years' => $academicYears
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