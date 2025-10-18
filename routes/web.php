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

// SPA Routes - All routes should return the dashboard view for client-side routing
Route::get('/', function () {
    return view('dashboard');
});

Route::get('/dashboard', function () {
    return view('dashboard');
});

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

// Catch-all route for SPA - handles any other routes
Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '.*');