<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', ['username' => $request->username, 'ip' => $request->ip(), 'body' => $request->all()]);
            Log::info('Request input', $request->all());

            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $admin = Admin::where('username', $request->username)->first();

            if (!$admin || !is_string($admin->password) || !Hash::check($request->password, $admin->password)) {
                Log::warning('Invalid credentials', ['username' => $request->username]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Create Sanctum token for API auth
            $token = $admin->createToken('auth_token')->plainTextToken;

            Log::info('Login successful', ['username' => $admin->username]);

            // Return token in response (frontend will store it)
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token
            ]);
        } catch (\Throwable $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Server error during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out successfully']);
    }

    public function check(Request $request)
    {
        Log::info('Check auth', [
            'has_user' => (bool)$request->user(),
            'auth_header' => $request->header('Authorization'),
            'session_token' => session('auth_token') ? 'exists' : 'none'
        ]);
        
        // Check if user is authenticated via Sanctum token
        if ($request->user()) {
            Log::info('User authenticated via Sanctum');
            return response()->json([
                'success' => true, 
                'authenticated' => true,
                'user' => $request->user()
            ]);
        }
        
        // Check if token is in Authorization header
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            Log::info('Checking token from header', ['token' => substr($token, 0, 10) . '...']);
            
            $personalToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($personalToken && $personalToken->tokenable_id) {
                $user = $personalToken->tokenable;
                Log::info('Token valid, user authenticated');
                return response()->json([
                    'success' => true, 
                    'authenticated' => true,
                    'user' => $user
                ]);
            }
        }
        
        Log::info('No valid authentication found');
        return response()->json(['success' => true, 'authenticated' => false]);
    }

    public function me(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()]);
    }

    public function updateProfile(Request $request)
    {
        $admin = $request->user();
        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|required|email|unique:admins,email,' . $admin->admin_id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin->update($request->only(['email', 'first_name', 'last_name', 'phone', 'address']));

        return response()->json([
            'success' => true,
            'data' => $admin,
            'message' => 'Profile updated successfully'
        ]);
    }
}