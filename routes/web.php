<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Public Routes (No Authentication Required)
Route::get('/login', function () {
    return view('login');
})->name('login');

// Excel Export Route (No Authentication Required for testing)
Route::get('/export-excel', 'App\Http\Controllers\ExcelController@exportSample');

// Protected Routes - Require Authentication
Route::middleware(['check.web.auth'])->group(function () {
    
    // Redirect root to dashboard
    Route::get('/', function () {
        return view('dashboard');
    });

    // SPA Routes - Protected by authentication middleware
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    Route::get('/faculty', function () {
        return view('dashboard');
    });

    Route::get('/students', function () {
        return view('dashboard');
    });

    Route::get('/reports', function () {
        return view('dashboard');
    });

    Route::get('/settings', function () {
        return view('dashboard');
    });

    Route::get('/profile', function () {
        return view('dashboard');
    });

    Route::get('/archive', function () {
        return view('dashboard');
    });

    // Catch-all route for SPA - handles any other protected routes
    Route::get('/{any}', function () {
        return view('dashboard');
    })->where('any', '.*');
    
});