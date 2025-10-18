<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated via cookie
        $authToken = $request->cookie('auth_token');
        $adminId = $request->cookie('admin_id');
        
        // Debug logging (remove in production)
        // \Log::info('AuthMiddleware Debug', [
        //     'auth_token' => $authToken,
        //     'admin_id' => $adminId,
        //     'url' => $request->url()
        // ]);
        
        if (!$authToken || !$adminId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. Please login.',
                'redirect' => '/login'
            ], 401);
        }

        // Verify the admin exists and token is valid
        try {
            $admin = DB::table('admins')
                ->where('admin_id', $adminId)
                ->first();

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid authentication. Please login again.',
                    'redirect' => '/login'
                ], 401);
            }

            // Verify the token (in a real app, you'd use JWT or similar)
            // For now, we'll check if the token matches a pattern
            // Debug logging (remove in production)
            // \Log::info('Token validation', [
            //     'token' => $authToken,
            //     'pattern_match' => preg_match('/^admin-token-\d+-\d+$/', $authToken)
            // ]);
            
            if (!preg_match('/^admin-token-\d+-\d+$/', $authToken)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token. Please login again.',
                    'redirect' => '/login'
                ], 401);
            }

            // Add admin info to request for use in controllers
            $request->merge(['admin' => $admin]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication error. Please login again.',
                'redirect' => '/login'
            ], 401);
        }

        return $next($request);
    }
}