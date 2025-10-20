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

        // For SPA routes, inject a script to check authentication client-side
        // This prevents server-side blocking of the initial page load
        $response = $next($request);
        
        // Add authentication check script to the response
        $authScript = "
        <script>
        (function() {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            
            // Verify token with server
            fetch('/api/auth/check', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    localStorage.removeItem('auth_token');
                    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    window.location.href = '/login';
                }
            }).catch(() => {
                localStorage.removeItem('auth_token');
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = '/login';
            });
        })();
        </script>
        ";
        
        $content = $response->getContent();
        $content = str_replace('</head>', $authScript . '</head>', $content);
        $response->setContent($content);
        
        return $response;
    }
}
