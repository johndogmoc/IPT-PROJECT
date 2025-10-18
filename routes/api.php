<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AuthController;

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
    });

    // ---------- Faculty Routes ----------
    Route::prefix('faculty')->group(function () {
        Route::get('/list', [FacultyController::class, 'index']);
        Route::post('/create', [FacultyController::class, 'store']);
        Route::get('/dropdown-data', [FacultyController::class, 'getDropdownData']);
        Route::get('/{id}', [FacultyController::class, 'show']);
        Route::put('/{id}/update', [FacultyController::class, 'update']);
        Route::delete('/{id}/delete', [FacultyController::class, 'destroy']);
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
});