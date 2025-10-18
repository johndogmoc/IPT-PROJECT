<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Check authentication status
     */
    public function check(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated',
                    'authenticated' => false
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Authenticated',
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'role' => $user->role
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication check failed',
                'authenticated' => false
            ], 500);
        }
    }

    /**
     * Admin login
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $admin = Admin::where('username', $request->username)->first();

            if (!$admin || !Hash::check($request->password, $admin->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $token = $admin->createToken('auth-token')->plainTextToken;

            $cookie = cookie(
                'auth_token',
                $token,
                60 * 24,
                null,
                null,
                config('app.env') !== 'local',
                true,
                false,
                'Strict'
            );

            $admin->update(['last_login_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $admin->id,
                    'role' => $admin->role
                ]
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Admin logout
     */
    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ])->withCookie(Cookie::forget('auth_token'));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get current admin info
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'role' => $user->role,
                    'last_login_at' => $user->last_login_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user info',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => ['sometimes', 'string', 'unique:admins,username,' . $request->user()->id],
                'email' => ['sometimes', 'email', 'unique:admins,email,' . $request->user()->id],
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'current_password' => 'required_with:new_password',
                'new_password' => 'sometimes|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if ($request->has('current_password') && !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $updateData = array_filter($request->only([
                'username',
                'email',
                'first_name',
                'last_name'
            ]));

            if ($request->filled('new_password')) {
                $updateData['password'] = Hash::make($request->new_password);
            }

            $updateData['updated_at'] = now();
            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'role' => $user->role
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
