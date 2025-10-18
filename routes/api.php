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
// Authentication Routes
// =======================
Route::prefix('auth')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/check', [AuthController::class, 'check']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/update-profile', [AuthController::class, 'updateProfile']);
    });
});

// =======================
// Protected API Routes
// =======================
Route::middleware('auth.middleware')->group(function () {

    // ---------- Student Routes ----------
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store']);
        Route::get('/dropdown-data', [StudentController::class, 'getDropdownData']);
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::put('/{id}', [StudentController::class, 'update']);
        Route::delete('/{id}', [StudentController::class, 'destroy']);
    });

    // ---------- Faculty Routes ----------
    Route::prefix('faculty')->group(function () {
        Route::get('/', [FacultyController::class, 'index']);
        Route::post('/', [FacultyController::class, 'store']);
        Route::get('/dropdown-data', [FacultyController::class, 'getDropdownData']);
        Route::get('/{id}', [FacultyController::class, 'show']);
        Route::put('/{id}', [FacultyController::class, 'update']);
        Route::delete('/{id}', [FacultyController::class, 'destroy']);
    });

    // ---------- Department Routes ----------
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index']);
        Route::post('/', [DepartmentController::class, 'store']);
        Route::get('/{id}', [DepartmentController::class, 'show']);
        Route::put('/{id}', [DepartmentController::class, 'update']);
        Route::delete('/{id}', [DepartmentController::class, 'destroy']);
    });

    // ---------- Course Routes ----------
    Route::prefix('courses')->group(function () {
        Route::get('/', [CourseController::class, 'index']);
        Route::post('/', [CourseController::class, 'store']);
        Route::get('/dropdown-data', [CourseController::class, 'getDropdownData']);
        Route::get('/{id}', [CourseController::class, 'show']);
        Route::put('/{id}', [CourseController::class, 'update']);
        Route::delete('/{id}', [CourseController::class, 'destroy']);
    });

    // ---------- Academic Year Routes ----------
    Route::prefix('academic-years')->group(function () {
        Route::get('/', [AcademicYearController::class, 'index']);
        Route::post('/', [AcademicYearController::class, 'store']);
        Route::get('/{id}', [AcademicYearController::class, 'show']);
        Route::put('/{id}', [AcademicYearController::class, 'update']);
        Route::delete('/{id}', [AcademicYearController::class, 'destroy']);
    });
});
