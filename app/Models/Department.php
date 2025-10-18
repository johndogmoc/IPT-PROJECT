<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'departments';
    protected $primaryKey = 'department_id';

    protected $fillable = ['department_name', 'department_head'];

    public function courses()
    {
        return $this->hasMany(Course::class, 'department_id', 'department_id');
    }

    public function facultyProfiles()
    {
        return $this->hasMany(FacultyProfile::class, 'department_id', 'department_id');
    }

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class, 'department_id', 'department_id');
    }
}