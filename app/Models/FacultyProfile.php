<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FacultyProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'faculty_profiles';
    protected $primaryKey = 'faculty_id';

    protected $fillable = [
        'f_name', 'm_name', 'l_name', 'suffix', 'date_of_birth', 'sex',
        'phone_number', 'email_address', 'address', 'position', 'department_id'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }
}