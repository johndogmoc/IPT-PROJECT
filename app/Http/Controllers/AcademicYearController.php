<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AcademicYearController extends Controller
{
    /**
     * Display a listing of academic years.
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('academic_years')
                ->whereNull('deleted_at')
                ->select('*');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where('school_year', 'like', "%{$search}%");
            }

            $academicYears = $query->orderBy('created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $academicYears,
                'message' => 'Academic years retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving academic years: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created academic year.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'school_year' => 'required|string|max:255|unique:academic_years,school_year'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $academicYearId = DB::table('academic_years')->insertGetId([
                'school_year' => $request->school_year,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $academicYear = DB::table('academic_years')
                ->where('academic_year_id', $academicYearId)
                ->first();

            return response()->json([
                'success' => true,
                'data' => $academicYear,
                'message' => 'Academic year created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified academic year.
     */
    public function show($id)
    {
        try {
            $academicYear = DB::table('academic_years')
                ->where('academic_year_id', $id)
                ->whereNull('deleted_at')
                ->first();

            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $academicYear,
                'message' => 'Academic year retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified academic year.
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'school_year' => 'required|string|max:255|unique:academic_years,school_year,' . $id . ',academic_year_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = DB::table('academic_years')
                ->where('academic_year_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'school_year' => $request->school_year,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found or could not be updated'
                ], 404);
            }

            $academicYear = DB::table('academic_years')
                ->where('academic_year_id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'data' => $academicYear,
                'message' => 'Academic year updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified academic year (soft delete).
     */
    public function destroy($id)
    {
        try {
            $deleted = DB::table('academic_years')
                ->where('academic_year_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now()
                ]);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found or could not be deleted'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Academic year archived successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving academic year: ' . $e->getMessage()
            ], 500);
        }
    }
}