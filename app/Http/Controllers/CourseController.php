<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('courses')
                ->leftJoin('departments', 'courses.department_id', '=', 'departments.department_id')
                ->whereNull('courses.deleted_at')
                ->select(
                    'courses.*',
                    'departments.department_name'
                );

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('courses.course_name', 'like', "%{$search}%")
                      ->orWhere('departments.department_name', 'like', "%{$search}%");
                });
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('courses.department_id', $request->department_id);
            }

            $courses = $query->orderBy('courses.created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $courses,
                'message' => 'Courses retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving courses: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created course.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'course_name' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $courseId = DB::table('courses')->insertGetId([
                'course_name' => $request->course_name,
                'department_id' => $request->department_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $course = DB::table('courses')
                ->leftJoin('departments', 'courses.department_id', '=', 'departments.department_id')
                ->where('courses.course_id', $courseId)
                ->select(
                    'courses.*',
                    'departments.department_name'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $course,
                'message' => 'Course created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified course.
     */
    public function show($id)
    {
        try {
            $course = DB::table('courses')
                ->leftJoin('departments', 'courses.department_id', '=', 'departments.department_id')
                ->where('courses.course_id', $id)
                ->whereNull('courses.deleted_at')
                ->select(
                    'courses.*',
                    'departments.department_name'
                )
                ->first();

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $course,
                'message' => 'Course retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified course.
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'course_name' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = DB::table('courses')
                ->where('course_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'course_name' => $request->course_name,
                    'department_id' => $request->department_id,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found or could not be updated'
                ], 404);
            }

            $course = DB::table('courses')
                ->leftJoin('departments', 'courses.department_id', '=', 'departments.department_id')
                ->where('courses.course_id', $id)
                ->select(
                    'courses.*',
                    'departments.department_name'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $course,
                'message' => 'Course updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified course (soft delete).
     */
    public function destroy($id)
    {
        try {
            $deleted = DB::table('courses')
                ->where('course_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now()
                ]);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found or could not be deleted'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Course archived successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving course: ' . $e->getMessage()
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