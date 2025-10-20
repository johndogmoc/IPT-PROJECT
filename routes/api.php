<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArchiveController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// =======================
 // Authentication Routes (Public)
// =======================
Route::prefix('auth')->group(function () {
    // Public (no auth required)
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/check', [AuthController::class, 'check']);
});

// =======================
 // Protected Auth Routes
// =======================
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
});

// =======================
 // Protected API Routes
// =======================
Route::middleware('auth:sanctum')->group(function () {

    // ---------- Student Routes ----------
    Route::prefix('students')->group(function () {
        Route::get('/list', [StudentController::class, 'index']);
        Route::post('/create', [StudentController::class, 'store']);
        Route::get('/dropdown-data', [StudentController::class, 'getDropdownData']);
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::put('/{id}/update', [StudentController::class, 'update']);
        Route::delete('/{id}/delete', [StudentController::class, 'destroy']);
        Route::post('/{id}/archive', [StudentController::class, 'archive']);
    });

    // ---------- Faculty Routes ----------
    Route::prefix('faculty')->group(function () {
        Route::get('/list', [FacultyController::class, 'index']);
        Route::post('/create', [FacultyController::class, 'store']);
        Route::get('/dropdown-data', [FacultyController::class, 'getDropdownData']);
        Route::get('/{id}', [FacultyController::class, 'show']);
        Route::put('/{id}/update', [FacultyController::class, 'update']);
        Route::delete('/{id}/delete', [FacultyController::class, 'destroy']);
        Route::post('/{id}/archive', [FacultyController::class, 'archive']);
    });

    // ---------- Department Routes ----------
    Route::prefix('departments')->group(function () {
        Route::get('/list', [DepartmentController::class, 'index']);
        Route::post('/create', [DepartmentController::class, 'store']);
        Route::get('/{id}', [DepartmentController::class, 'show']);
        Route::put('/{id}/update', [DepartmentController::class, 'update']);
        Route::delete('/{id}/delete', [DepartmentController::class, 'destroy']);
    });

    // ---------- Course Routes ----------
    Route::prefix('courses')->group(function () {
        Route::get('/list', [CourseController::class, 'index']);
        Route::post('/create', [CourseController::class, 'store']);
        Route::get('/dropdown-data', [CourseController::class, 'getDropdownData']);
        Route::get('/{id}', [CourseController::class, 'show']);
        Route::put('/{id}/update', [CourseController::class, 'update']);
        Route::delete('/{id}/delete', [CourseController::class, 'destroy']);
    });

    // ---------- Academic Year Routes ----------
    Route::prefix('academic')->group(function () {
        Route::get('/list', [AcademicYearController::class, 'index']);
        Route::post('/create', [AcademicYearController::class, 'store']);
        Route::get('/{id}', [AcademicYearController::class, 'show']);
        Route::put('/{id}/update', [AcademicYearController::class, 'update']);
        Route::delete('/{id}/delete', [AcademicYearController::class, 'destroy']);
    });

    // ---------- Archive Routes ----------
    Route::prefix('archive')->group(function () {
        Route::get('/students', [ArchiveController::class, 'getArchivedStudents']);
        Route::get('/faculty', [ArchiveController::class, 'getArchivedFaculty']);
        Route::get('/courses', [ArchiveController::class, 'getArchivedCourses']);
        Route::get('/departments', [ArchiveController::class, 'getArchivedDepartments']);
        Route::get('/academic-years', [ArchiveController::class, 'getArchivedAcademicYears']);
        
        // Restore routes
        Route::post('/students/{id}/restore', [ArchiveController::class, 'restoreStudent']);
        Route::post('/faculty/{id}/restore', [ArchiveController::class, 'restoreFaculty']);
        Route::post('/courses/{id}/restore', [ArchiveController::class, 'restoreCourse']);
        Route::post('/departments/{id}/restore', [ArchiveController::class, 'restoreDepartment']);
        Route::post('/academic-years/{id}/restore', [ArchiveController::class, 'restoreAcademicYear']);
        
        // Permanent delete routes
        Route::delete('/students/{id}/permanent-delete', [ArchiveController::class, 'permanentDeleteStudent']);
        Route::delete('/faculty/{id}/permanent-delete', [ArchiveController::class, 'permanentDeleteFaculty']);
        Route::delete('/courses/{id}/permanent-delete', [ArchiveController::class, 'permanentDeleteCourse']);
        Route::delete('/departments/{id}/permanent-delete', [ArchiveController::class, 'permanentDeleteDepartment']);
        Route::delete('/academic-years/{id}/permanent-delete', [ArchiveController::class, 'permanentDeleteAcademicYear']);
    });
});