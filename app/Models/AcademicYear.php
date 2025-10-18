<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'academic_years';
    protected $primaryKey = 'academic_year_id';

    protected $fillable = ['school_year'];

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class, 'academic_year_id', 'academic_year_id');
    }
}