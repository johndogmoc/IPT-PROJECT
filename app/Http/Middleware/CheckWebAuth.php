<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class CheckWebAuth
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
        // Always allow AJAX/API requests - they use API middleware
        if ($request->ajax() || $request->wantsJson() || $request->is('api/*')) {
            return $next($request);
        }

        // Allow login page access
        if ($request->is('login')) {
            return $next($request);
        }

        // Check for authentication token in multiple places
        $token = null;
        
        // 1. Check localStorage via JavaScript (most reliable for SPA)
        // We'll inject a script to check this
        
        // 2. Check session (set by server on login)
        if (!$token) {
            $token = $request->session()->get('auth_token');
        }
        
        // 3. Check cookie (backup)
        if (!$token) {
            $token = $request->cookie('auth_token');
        }

        // If no token found anywhere, redirect to login
        if (!$token) {
            return redirect('/login')->with('message', 'Please log in to access this page.');
        }

        // Validate the token exists in database
        try {
            $accessToken = PersonalAccessToken::findToken($token);
            
            if (!$accessToken || !$accessToken->tokenable) {
                // Invalid token, clear session and redirect
                $request->session()->forget('auth_token');
                return redirect('/login')
                    ->withCookie(cookie()->forget('auth_token'))
                    ->with('message', 'Your session has expired. Please log in again.');
            }

            // Token is valid, allow access
            return $next($request);

        } catch (\Exception $e) {
            // Error validating token, clear and redirect
            $request->session()->forget('auth_token');
            return redirect('/login')
                ->withCookie(cookie()->forget('auth_token'))
                ->with('message', 'Please log in to access this page.');
        }
    }
}
