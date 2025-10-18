<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request)
    {
        try {
            $query = Course::with('department')->whereNull('deleted_at');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('course_name', 'like', "%{$search}%")
                      ->orWhereHas('department', function($qd) use ($search) {
                          $qd->where('department_name', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('department_id', $request->department_id);
            }

            $courses = $query->orderBy('created_at', 'desc')->paginate(10);

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

            $course = Course::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $course->load('department'),
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
            $course = Course::with('department')->whereNull('deleted_at')->find($id);

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
            $course = Course::whereNull('deleted_at')->find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found or could not be updated'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'course_name' => 'sometimes|required|string|max:255',
                'department_id' => 'sometimes|required|exists:departments,department_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $course->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $course->load('department'),
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
            $course = Course::whereNull('deleted_at')->find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found or could not be deleted'
                ], 404);
            }

            $course->delete();

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