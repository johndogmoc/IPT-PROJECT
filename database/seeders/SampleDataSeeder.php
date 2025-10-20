<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Sample data seeder disabled
        // All data should be added through the application interface
        $this->command->info('Sample data seeder is disabled.');
        $this->command->info('Please add departments, courses, faculty, and students through the application.');
    }
}
