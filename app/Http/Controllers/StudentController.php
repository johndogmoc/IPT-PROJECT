<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            $query = DB::table('student_profiles')
                ->leftJoin('departments', 'student_profiles.department_id', '=', 'departments.department_id')
                ->leftJoin('courses', 'student_profiles.course_id', '=', 'courses.course_id')
                ->leftJoin('academic_years', 'student_profiles.academic_year_id', '=', 'academic_years.academic_year_id')
                ->whereNull('student_profiles.deleted_at')
                ->select(
                    'student_profiles.*',
                    'departments.department_name',
                    'courses.course_name',
                    'academic_years.school_year'
                );

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('student_profiles.f_name', 'like', "%{$search}%")
                      ->orWhere('student_profiles.l_name', 'like', "%{$search}%")
                      ->orWhere('student_profiles.email_address', 'like', "%{$search}%")
                      ->orWhere('student_profiles.phone_number', 'like', "%{$search}%");
                });
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('student_profiles.department_id', $request->department_id);
            }

            // Filter by course
            if ($request->has('course_id') && $request->course_id) {
                $query->where('student_profiles.course_id', $request->course_id);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('student_profiles.status', $request->status);
            }

            $students = $query->orderBy('student_profiles.created_at', 'desc')->paginate(10);

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
                'suffix' => 'nullable|string|max:255',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:Male,Female',
                'phone_number' => 'required|string|max:255',
                'email_address' => 'required|email|unique:student_profiles,email_address',
                'address' => 'required|string',
                'status' => 'required|in:Active,Inactive,Graduated,Dropped',
                'department_id' => 'required|exists:departments,department_id',
                'course_id' => 'required|exists:courses,course_id',
                'academic_year_id' => 'required|exists:academic_years,academic_year_id',
                'year_level' => 'required|integer|min:1|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $studentId = DB::table('student_profiles')->insertGetId([
                'f_name' => $request->f_name,
                'm_name' => $request->m_name,
                'l_name' => $request->l_name,
                'suffix' => $request->suffix,
                'date_of_birth' => $request->date_of_birth,
                'sex' => $request->sex,
                'phone_number' => $request->phone_number,
                'email_address' => $request->email_address,
                'address' => $request->address,
                'status' => $request->status,
                'department_id' => $request->department_id,
                'course_id' => $request->course_id,
                'academic_year_id' => $request->academic_year_id,
                'year_level' => $request->year_level,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $student = DB::table('student_profiles')
                ->leftJoin('departments', 'student_profiles.department_id', '=', 'departments.department_id')
                ->leftJoin('courses', 'student_profiles.course_id', '=', 'courses.course_id')
                ->leftJoin('academic_years', 'student_profiles.academic_year_id', '=', 'academic_years.academic_year_id')
                ->where('student_profiles.student_id', $studentId)
                ->select(
                    'student_profiles.*',
                    'departments.department_name',
                    'courses.course_name',
                    'academic_years.school_year'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $student,
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
            $student = DB::table('student_profiles')
                ->leftJoin('departments', 'student_profiles.department_id', '=', 'departments.department_id')
                ->leftJoin('courses', 'student_profiles.course_id', '=', 'courses.course_id')
                ->leftJoin('academic_years', 'student_profiles.academic_year_id', '=', 'academic_years.academic_year_id')
                ->where('student_profiles.student_id', $id)
                ->whereNull('student_profiles.deleted_at')
                ->select(
                    'student_profiles.*',
                    'departments.department_name',
                    'courses.course_name',
                    'academic_years.school_year'
                )
                ->first();

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
            $validator = Validator::make($request->all(), [
                'f_name' => 'required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'required|string|max:255',
                'suffix' => 'nullable|string|max:255',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:Male,Female',
                'phone_number' => 'required|string|max:255',
                'email_address' => ['required', 'email', Rule::unique('student_profiles', 'email_address')->ignore($id, 'student_id')],
                'address' => 'required|string',
                'status' => 'required|in:Active,Inactive,Graduated,Dropped',
                'department_id' => 'required|exists:departments,department_id',
                'course_id' => 'required|exists:courses,course_id',
                'academic_year_id' => 'required|exists:academic_years,academic_year_id',
                'year_level' => 'required|integer|min:1|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = DB::table('student_profiles')
                ->where('student_id', $id)
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
                    'status' => $request->status,
                    'department_id' => $request->department_id,
                    'course_id' => $request->course_id,
                    'academic_year_id' => $request->academic_year_id,
                    'year_level' => $request->year_level,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found or could not be updated'
                ], 404);
            }

            $student = DB::table('student_profiles')
                ->leftJoin('departments', 'student_profiles.department_id', '=', 'departments.department_id')
                ->leftJoin('courses', 'student_profiles.course_id', '=', 'courses.course_id')
                ->leftJoin('academic_years', 'student_profiles.academic_year_id', '=', 'academic_years.academic_year_id')
                ->where('student_profiles.student_id', $id)
                ->select(
                    'student_profiles.*',
                    'departments.department_name',
                    'courses.course_name',
                    'academic_years.school_year'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $student,
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
            $deleted = DB::table('student_profiles')
                ->where('student_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now()
                ]);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found or could not be deleted'
                ], 404);
            }

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
            $departments = DB::table('departments')
                ->whereNull('deleted_at')
                ->select('department_id', 'department_name')
                ->get();

            $courses = DB::table('courses')
                ->whereNull('deleted_at')
                ->select('course_id', 'course_name', 'department_id')
                ->get();

            $academicYears = DB::table('academic_years')
                ->whereNull('deleted_at')
                ->select('academic_year_id', 'school_year')
                ->get();

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