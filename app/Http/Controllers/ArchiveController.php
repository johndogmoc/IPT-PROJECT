<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    /**
     * Get archived students.
     */
    public function getArchivedStudents()
    {
        try {
            $students = StudentProfile::onlyTrashed()
                ->with(['department', 'course', 'academicYear'])
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $students,
                'message' => 'Archived students retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archived students: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived faculty.
     */
    public function getArchivedFaculty()
    {
        try {
            $faculty = FacultyProfile::onlyTrashed()
                ->with(['department'])
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'message' => 'Archived faculty retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archived faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived courses.
     */
    public function getArchivedCourses()
    {
        try {
            $courses = Course::onlyTrashed()
                ->with(['department'])
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $courses,
                'message' => 'Archived courses retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archived courses: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived departments.
     */
    public function getArchivedDepartments()
    {
        try {
            $departments = Department::onlyTrashed()
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $departments,
                'message' => 'Archived departments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archived departments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived academic years.
     */
    public function getArchivedAcademicYears()
    {
        try {
            $academicYears = AcademicYear::onlyTrashed()
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $academicYears,
                'message' => 'Archived academic years retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving archived academic years: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived student.
     */
    public function restoreStudent($id)
    {
        try {
            $student = StudentProfile::onlyTrashed()->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived student not found'
                ], 404);
            }

            $student->restore();

            return response()->json([
                'success' => true,
                'message' => 'Student restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived faculty.
     */
    public function restoreFaculty($id)
    {
        try {
            $faculty = FacultyProfile::onlyTrashed()->find($id);

            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived faculty not found'
                ], 404);
            }

            $faculty->restore();

            return response()->json([
                'success' => true,
                'message' => 'Faculty restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived course.
     */
    public function restoreCourse($id)
    {
        try {
            $course = Course::onlyTrashed()->find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived course not found'
                ], 404);
            }

            $course->restore();

            return response()->json([
                'success' => true,
                'message' => 'Course restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived department.
     */
    public function restoreDepartment($id)
    {
        try {
            $department = Department::onlyTrashed()->find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived department not found'
                ], 404);
            }

            $department->restore();

            return response()->json([
                'success' => true,
                'message' => 'Department restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived academic year.
     */
    public function restoreAcademicYear($id)
    {
        try {
            $academicYear = AcademicYear::onlyTrashed()->find($id);

            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived academic year not found'
                ], 404);
            }

            $academicYear->restore();

            return response()->json([
                'success' => true,
                'message' => 'Academic year restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete student.
     */
    public function permanentDeleteStudent($id)
    {
        try {
            $student = StudentProfile::onlyTrashed()->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived student not found'
                ], 404);
            }

            $student->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Student permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error permanently deleting student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete faculty.
     */
    public function permanentDeleteFaculty($id)
    {
        try {
            $faculty = FacultyProfile::onlyTrashed()->find($id);

            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived faculty not found'
                ], 404);
            }

            $faculty->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Faculty permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error permanently deleting faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete course.
     */
    public function permanentDeleteCourse($id)
    {
        try {
            $course = Course::onlyTrashed()->find($id);

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived course not found'
                ], 404);
            }

            $course->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Course permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error permanently deleting course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete department.
     */
    public function permanentDeleteDepartment($id)
    {
        try {
            $department = Department::onlyTrashed()->find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived department not found'
                ], 404);
            }

            $department->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Department permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error permanently deleting department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete academic year.
     */
    public function permanentDeleteAcademicYear($id)
    {
        try {
            $academicYear = AcademicYear::onlyTrashed()->find($id);

            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived academic year not found'
                ], 404);
            }

            $academicYear->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Academic year permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error permanently deleting academic year: ' . $e->getMessage()
            ], 500);
        }
    }
}
