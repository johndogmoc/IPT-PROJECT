<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class WebAuthMiddleware
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
        // Check if this is an AJAX request (API call)
        if ($request->expectsJson()) {
            // For API requests, use Sanctum authentication
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access. Please login.',
                    'authenticated' => false
                ], 401);
            }
        } else {
            // For web requests, check if user has valid token in localStorage
            // This will be handled by JavaScript on the frontend
            // If no valid token, redirect to login
            
            // We'll let the frontend handle this check via JavaScript
            // The dashboard view will check authentication status on load
        }

        return $next($request);
    }
}
