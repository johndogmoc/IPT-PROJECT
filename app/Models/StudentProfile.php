<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'student_profiles';
    protected $primaryKey = 'student_id';

    protected $fillable = [
        'f_name', 'm_name', 'l_name', 'suffix', 'date_of_birth', 'sex',
        'phone_number', 'email_address', 'address', 'status',
        'department_id', 'course_id', 'academic_year_id', 'year_level'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }
}